import dynamic from "next/dynamic";

const Script = dynamic(() => import("./script"), { ssr: false });

const Legal = ({ termlyId }: { termlyId: string }) => {
  return (
    <>
      <div
        // @ts-ignore
        name="termly-embed"
        data-id={termlyId}
        data-type="iframe"
      ></div>
      <Script />
    </>
  );
};

export default Legal;
