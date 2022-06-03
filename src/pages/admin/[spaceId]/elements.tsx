import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { res } = context;
  const { spaceId } = context.query;
  res.writeHead(301, { location: `/editor/${spaceId}/elements` });
  res.end();

  return {
    props: {},
  };
};

const ElementsRedirect = (context: any) => {};

export default ElementsRedirect;
