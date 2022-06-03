import { Grid, Typography } from "@material-ui/core";
import React from "react";
import styles from "./styles.module.scss";
import { FeaturedExperiencesResult } from "../../../../shared/sharedTypes";
import { SpaceMeta } from "../../../../shared/spaceMeta";
import { SectionContainer } from "./utils";
import { getMetaImagePath } from "media/assetPaths";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import clsx from "clsx";
// import { store } from

export const CurrentExhibitionsElementID = "CurrentExhibitions";
export const placeHolderImageUrl =
  "https://dummyimage.com/480x270/eee/aaa.png&text=Image+not+found";

// https://stackoverflow.com/questions/40255345/maximum-amount-of-characters-in-a-div-paragraph-tag-in-react
// const LongText = ({ content, limit }: { content: string; limit: number }) => {
//   const [showAll, setShowAll] = useState(false);

//   const showMore = () => setShowAll(true);
//   const showLess = () => setShowAll(false);

//   if (content.length <= limit) {
//     // there is nothing more to show
//     return <div>{content}</div>;
//   }
//   if (showAll) {
//     // We show the extended text and a link to reduce it
//     return (
//       <Typography variant="body2">
//         {content}
//         <button onClick={showLess} className={styles.longTextButton}>
//           Read less
//         </button>
//       </Typography>
//     );
//   }
//   // In the final case, we show a text with ellipsis and a `Read more` button
//   const toShow = content.substring(0, limit) + "...";
//   return (
//     <Typography variant="body2">
//       {toShow}
//       <button onClick={showMore} className={styles.longTextButton}>
//         Read more
//       </button>
//     </Typography>
//   );
// };

const SpaceCardGridItem = ({
  spaceId,
  meta,
}: {
  spaceId: string;
  meta: SpaceMeta;
}) => {
  const nameOrId = meta?.name || spaceId;
  const metaImageUrl = getMetaImagePath(meta.metaImage);

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card className={styles.experienceCardRoot}>
        <CardActionArea>
          <a href={`/spaces/${spaceId}`}>
            <CardMedia
              className={styles.experienceCardMedia}
              image={metaImageUrl || placeHolderImageUrl}
              title={`Preview of space ${nameOrId}`}
            />
            <CardContent className={styles.experienceCardContent}>
              <Typography
                variant="h6"
                component="h6"
                className={styles.experienceName}
              >
                {nameOrId}
              </Typography>
              <Typography
                variant="overline"
                className={styles.experienceHostName}
              >
                {meta.hostName}
              </Typography>
              {/* <Typography variant="body2" color="textSecondary" component="p">
          Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
          across all continents except Antarctica
        </Typography> */}
            </CardContent>
          </a>
        </CardActionArea>
        {/* <CardActions>
      <Button size="small" color="primary">
        Share
      </Button>
      <Button size="small" color="primary">
        Learn More
      </Button>
    </CardActions> */}
      </Card>
    </Grid>
    // <Grid item xs={12} md={6} lg={4} className={styles.exhibitionCardGridItem}>
    //   <Grid
    //     container
    //     spacing={1}
    //     alignItems="flex-start"
    //     justify="space-between"
    //     className={styles.exhibitionCardInner}
    //   >
    //     <Grid item xs={12} className={styles.metaImageContainer}>
    //       <img
    //         src={metaImageUrl || placeHolderImageUrl}
    //         alt={`Preview of space ${nameOrId}`}
    //       />
    //     </Grid>
    //     <Grid
    //       item
    //       xs={12}
    //       container
    //       direction="column"
    //       className={styles.exhibitionCardInfoContainer}
    //     >
    //       <Grid item>
    //         <Typography variant="h6">{nameOrId}</Typography>
    //       </Grid>
    //       <Grid item>
    //         <Typography variant="overline">{meta.hostName}</Typography>
    //       </Grid>
    //     </Grid>
    //   </Grid>
    // </Grid>
  );
};

export const CurrentExhibitions = ({
  featuredExperiences,
}: {
  featuredExperiences: FeaturedExperiencesResult;
}) => {
  return (
    <SectionContainer>
      <Grid
        id={CurrentExhibitionsElementID}
        className={clsx(styles.currentExhibitionContainer)}
        container
      >
        <Grid item xs={12} className={styles.title}>
          <Typography
            variant="h2"
            component="div"
            align="center"
            className={styles.title}
          >
            Featured Experiences
          </Typography>
          <Typography
            variant="body1"
            component="div"
            align="center"
            className={styles.subtitle}
          >
            Explore the growing network of live metaverse experiences created by
            the community.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {featuredExperiences.experiences.map((featured) => {
              return (
                <SpaceCardGridItem
                  key={featured.spaceId}
                  spaceId={featured.spaceId}
                  meta={featured.meta}
                ></SpaceCardGridItem>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </SectionContainer>
  );
};
