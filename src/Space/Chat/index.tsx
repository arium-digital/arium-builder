import {
  ChangeEvent,
  useCallback,
  useEffect,
  KeyboardEvent,
  FormEvent,
  useRef,
  SyntheticEvent,
} from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { useState } from "react";
import InputBase from "@material-ui/core/InputBase";
import styles from "./chat.module.scss";
import Grid from "@material-ui/core/Grid";
import {
  BehaviorSubject,
  from,
  Observable,
  Subject,
  combineLatest,
  interval,
} from "rxjs";
import { firestoreTimeNow, store } from "db";
import {
  filter,
  map,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs/operators";
import randomString from "random-string";
import { filterUndefined } from "libs/rx";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import * as styleVariables from "css/styleVariables";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import clsx from "clsx";
import Linkify from "react-linkify";
import { Box } from "@material-ui/core";

interface ChatMessage {
  name: string;
  userId: string;
  sessionId: string;
  spaceId: string;
  message: string;
}
interface ChatMessageWithTime extends ChatMessage {
  sentOn: { seconds: number };
}

interface ChatMessageWithIdAndColor extends ChatMessageWithTime {
  id: string;
  color: string;
}

const colors = [
  styleVariables.ariumMustard,
  styleVariables.ariumRed,
  styleVariables.ariumMint,
  styleVariables.ariumGreen,
];

const observeChatMessages = (
  spaceId: string,
  serverTimeOffset$: Observable<number>,
  maxChatMessageAgeSeconds: number
) => {
  const chatMessages$ = new Observable<ChatMessageWithIdAndColor[]>(
    (subscribe) => {
      const ref = store
        .collection("chatMessages")
        .where("spaceId", "==", spaceId)
        .orderBy("sentOn", "desc")
        .limit(150);

      const userColors: { [userId: string]: string } = {};

      let colorIndex = 0;

      const getColor = (sessionId: string) => {
        const existingColor = userColors[sessionId];
        if (existingColor) return existingColor;

        const color = colors[colorIndex % colors.length];
        userColors[sessionId] = color;

        colorIndex++;

        return color;
      };

      const unsubscribe = ref.onSnapshot((snapshot) => {
        const chatMessages = snapshot.docs.map((doc) => {
          const chatMessage = doc.data() as ChatMessageWithTime;
          return {
            ...chatMessage,
            id: doc.id,
            color: getColor(chatMessage.sessionId),
          };
        });

        subscribe.next(chatMessages.reverse());
      });

      return () => {
        unsubscribe();
      };
    }
  );

  const minServerTimeSeconds$ = interval(60 * 1000).pipe(
    // get this started since interval only ticks after delay
    startWith(0),
    withLatestFrom(serverTimeOffset$),
    map(([, serverTimeOffset]) => {
      const serverTimeSeconds =
        (new Date().getTime() + serverTimeOffset) / 1000;
      return serverTimeSeconds - maxChatMessageAgeSeconds;
    })
  );

  const filteredByTime$ = combineLatest([
    chatMessages$,
    minServerTimeSeconds$,
  ]).pipe(
    map(([messages, minServerTimeSeconds]) =>
      messages.filter((message) => {
        if (!message.sentOn) return true;
        return message.sentOn.seconds >= minServerTimeSeconds;
      })
    )
  );

  return filteredByTime$;
};

const useChatMessages = ({
  userName$,
  userId$,
  sessionId$,
  spaceId$,
  serverTimeOffset$,
}: {
  userName$: Observable<string | null | undefined>;
  userId$: Observable<string | undefined>;
  sessionId$: Observable<string | undefined>;
  spaceId$: Observable<string | undefined>;
  serverTimeOffset$: Observable<number>;
}) => {
  const [chatMessages$] = useState(
    new BehaviorSubject<ChatMessageWithIdAndColor[]>([])
  );

  useEffect(() => {
    const sub = spaceId$
      .pipe(
        switchMap((spaceId) => {
          if (!spaceId) return from([]);

          // show chat messages up to 6 hours old
          const maxChatMessageAgeSeconds = 60 * 60 * 6;

          return observeChatMessages(
            spaceId,
            serverTimeOffset$,
            maxChatMessageAgeSeconds
          );
        })
      )
      .subscribe(chatMessages$);

    return () => {
      sub.unsubscribe();
    };
  }, [chatMessages$, serverTimeOffset$, spaceId$]);

  const [sendChatMessage$] = useState(new Subject<string>());

  const sendChatMessage = useCallback(
    (message: string) => {
      sendChatMessage$.next(message);
    },
    [sendChatMessage$]
  );

  useEffect(() => {
    const randomName$ = from([`guest-${randomString({ length: 3 })}`]);

    const nameToUse$ = combineLatest([userName$, randomName$]).pipe(
      map(([name, randomName]) => {
        if (name) return name;

        return randomName;
      })
    );

    const userInfo$ = combineLatest([
      userId$.pipe(filterUndefined()),
      nameToUse$,
      spaceId$.pipe(filterUndefined()),
      sessionId$.pipe(filterUndefined()),
    ]);

    const sub = sendChatMessage$
      .pipe(
        withLatestFrom(userInfo$),
        map(([message, [userId, name, spaceId, sessionId]]) => {
          const chatMessage: ChatMessage = {
            userId,
            sessionId,
            spaceId,
            name,
            message,
          };

          return chatMessage;
        })
      )
      .subscribe({
        next: (chatMessage) => {
          store.collection("chatMessages").add({
            ...chatMessage,
            sentOn: firestoreTimeNow(),
          });
        },
      });

    return () => {
      sub.unsubscribe();
    };
  }, [userName$, sendChatMessage$, sessionId$, spaceId$, userId$]);

  return {
    sendChatMessage,
    chatMessages$,
  };
};

const linkDecorator = (
  decoratedHref: string,
  decoratedText: string,
  key: number
) => (
  <a target="blank" href={decoratedHref} key={key}>
    {" "}
    {decoratedText}{" "}
  </a>
);

const Chat = ({
  userName$,
  userId$,
  spaceId$,
  sessionId$,
  serverTimeOffset$,
}: {
  userName$: Observable<string | null | undefined>;
  userId$: Observable<string | undefined>;
  spaceId$: Observable<string | undefined>;
  sessionId$: Observable<string | undefined>;
  serverTimeOffset$: Observable<number>;
}) => {
  const { sendChatMessage, chatMessages$ } = useChatMessages({
    userName$,
    userId$,
    spaceId$,
    sessionId$,
    serverTimeOffset$,
  });

  const chatMessages = useCurrentValueFromObservable(chatMessages$, []);

  const [chatText, setChatText] = useState<string>("");

  const chatRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      // scroll chat elemen tto the top
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const sub = chatMessages$.pipe(filter((x) => x.length > 0)).subscribe({
      next: () => {
        scrollToBottom();
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [chatMessages$, scrollToBottom]);

  const handleChatChanged = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      e.stopPropagation();
      setChatText(e.target.value);
    },
    []
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (chatText.length > 0) {
        sendChatMessage(chatText);
        setChatText("");
      }
    },
    [chatText, sendChatMessage]
  );

  const handleClickAway = useCallback(() => {
    // @ts-ignore
    if (document.activeElement && document.activeElement.blur)
      // @ts-ignore
      document.activeElement.blur();
  }, []);

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback((e: SyntheticEvent) => {
    e.preventDefault();
    setExpanded((existing) => !existing);
  }, []);

  useEffect(() => {
    if (expanded) {
      scrollToBottom();
    }
  }, [expanded, scrollToBottom]);

  return (
    // <Hidden smDown>
    <Box position="relative" zIndex={1}>
      <Grid
        container
        direction="row"
        justify="flex-end"
        alignItems="flex-start"
      >
        <Grid
          item
          xs={11}
          md={4}
          lg={4}
          className={clsx(
            styles.chatContainer,
            expanded ? null : styles.minimized
          )}
        >
          <div className={styles.chatBg}></div>
          <ExpandMoreIcon
            className={clsx(
              styles.expandIcon,
              expanded ? styles.expanded : null
            )}
            onClick={toggleExpanded}
          />
          {!expanded && (
            <label className={styles.status} onClick={toggleExpanded}>
              chat ({chatMessages.length} messages)
            </label>
          )}
          {expanded && (
            <>
              <div className={styles.chatMessagesContainer} ref={chatRef}>
                <List className={styles.chat}>
                  {chatMessages.map((chatMessage) => (
                    <ListItem key={chatMessage.id}>
                      <b style={{ color: chatMessage.color }}>
                        {chatMessage.name}:&nbsp;
                      </b>
                      <Linkify componentDecorator={linkDecorator}>
                        {chatMessage.message}
                      </Linkify>
                    </ListItem>
                  ))}
                </List>
              </div>
              <List style={{ paddingTop: 0, paddingBottom: 0 }}>
                <ListItem>
                  <ClickAwayListener onClickAway={handleClickAway}>
                    <form
                      onSubmit={handleSubmit}
                      onKeyDown={handleKeyDown}
                      className={styles.form}
                    >
                      <InputBase
                        className={styles.input}
                        placeholder="Send a Message"
                        inputProps={{ "aria-label": "send a message" }}
                        value={chatText}
                        onChange={handleChatChanged}
                      />
                    </form>
                  </ClickAwayListener>
                </ListItem>
              </List>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
    // </Hidden>
  );
};

export default Chat;
