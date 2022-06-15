import Head from "next/head";

const title = ({ section, spaceId }: { section: string; spaceId: string }) =>
  `Editing ${spaceId} ${section}`;

const EditorHead = (props: { section: string; spaceId: string }) => (
  <Head>
    <title key="title">{title(props)}</title>
    <meta property="og:title" content={title(props)} key="og:title" />
  </Head>
);

export default EditorHead;
