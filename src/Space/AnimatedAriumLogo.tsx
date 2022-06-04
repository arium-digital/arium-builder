import clsx from "clsx";
import { useMemo } from "react";
import { CSSProperties } from "styled-components";
import styles from "../css/space.module.scss";
import LoadingProgress from "./Elements/lib/LoadingProgress";

export const AnimatedAriumLogo = ({
  height = "100vh",
  hint = "Loading...",
  color = "dark",
  showProgress,
  progress,
}: {
  hint?: string;
  color?: "light" | "dark";
  showProgress?: boolean;
  progress?: number;
} & Pick<CSSProperties, "height">) => {
  const isLight = useMemo(() => color === "light", [color]);
  const stroke = isLight ? "#303030" : "#FFFFF1";
  return (
    <div
      className={clsx(
        isLight ? styles.animatedLogoBright : styles.animatedLogo
      )}
      style={{
        height,
        position: "absolute",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <p>{hint}</p>

      <div>
        <div>
          <svg
            width={134}
            height={44}
            viewBox="0 0 134 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.3526 28.5563L18.4232 37.254L16.3648 39.1894L11.2943 30.4917L13.3526 28.5563Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.2944 30.4918L16.365 39.1895L8.88018 39.2427L3.80961 30.545L11.2944 30.4918Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22.9417 28.4876L13.3527 28.5563L18.4233 37.254L26.5255 37.1959"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M31.4677 6.87047L30.3105 30.3559L22.8257 30.4091L22.9432 28.4867L13.3526 28.5564L11.2943 30.4918L3.80948 30.545L29.2402 6.88674L31.4677 6.87047ZM18.5527 23.6958L23.2047 23.6626L23.9273 18.3116L18.5527 23.6958Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M35.5607 35.3773L35.3793 39.0546L30.3104 30.356L31.4675 6.87055L36.5381 15.5682L36.1183 24.0763"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M30.3103 30.3559L35.3793 39.0545L27.8945 39.1077L22.8255 30.4091L30.3103 30.3559Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M47.8519 14.615L48.9004 12.7559L49.3311 13.4946"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M52.9732 18.037L55.9811 12.7054L57.454 15.2319"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M54.1573 12.437C54.8858 12.4325 55.4948 12.52 55.9818 12.7029L52.9739 18.0345L51.3149 18.047C49.7245 18.0582 48.3341 18.3991 47.1497 19.0727C45.966 19.7437 44.9562 20.8184 44.1258 22.2912L39.6145 30.2895L32.6554 30.3401L42.5483 12.8017L48.9004 12.7558L47.8519 14.615C49.9512 13.1785 52.053 12.4525 54.1573 12.437Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M49.1973 30.9905L44.686 38.9888L39.6154 30.2911L44.1267 22.2928C44.9572 20.82 45.9663 19.7479 47.1507 19.0743C48.3351 18.4007 49.7255 18.0598 51.3158 18.0486L52.9749 18.0361L54.3955 20.4729"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M39.6145 30.2895L44.685 38.9872L37.7276 39.0369L32.657 30.3392L39.6145 30.2895Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M61.4376 8.99885C60.9974 8.3262 61.061 7.48798 61.6276 6.48256C62.1942 5.47714 63.084 4.62702 64.2978 3.92965C65.5084 3.23418 66.706 2.88272 67.8939 2.87337C69.0802 2.86498 69.8979 3.201 70.3457 3.88657C70.7909 4.57147 70.732 5.41777 70.1645 6.42157C69.6107 7.40432 68.7216 8.24096 67.4959 8.93661C66.2702 9.63226 65.0643 9.98429 63.8764 9.99363C62.6901 10.002 61.8769 9.66989 61.4376 8.99885Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M69.5884 13.3094L67.1355 9.12856C67.2555 9.06681 67.3755 9.00505 67.4958 8.93655C68.7215 8.2409 69.6106 7.40426 70.1644 6.42151C70.7101 5.45441 70.7851 4.63556 70.3946 3.96628L75.3192 12.4137"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M67.1368 9.12767C66.0333 9.69513 64.9474 9.9854 63.8776 9.99267C62.6913 10.0011 61.8765 9.66989 61.4388 8.9979L63.4499 12.4476"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M49.0417 30.2223L58.9346 12.6839L65.892 12.6343L56.0017 30.1733L49.0417 30.2223Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M65.6587 30.7376L61.0722 38.8711L56.0016 30.1734L65.8919 12.6344L68.0746 16.3784"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M56.0019 30.1734L61.0725 38.8711L54.1125 38.9201L49.0419 30.2224L56.0019 30.1734Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M71.4528 24.2457C71.1708 23.7688 71.2422 23.1582 71.6641 22.4092L77.2224 12.5527L80.1211 17.5249"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M90.0482 12.4609L84.7656 21.8258C83.3138 24.3992 81.22 26.4812 78.4827 28.073C75.7444 29.6631 72.9325 30.4695 70.0478 30.4897C67.1614 30.5108 65.2323 29.7377 64.2609 28.1745C63.2902 26.6087 63.5278 24.5398 64.9797 21.9664L70.2623 12.6016L77.2223 12.5526L71.6641 22.4091C71.2421 23.1581 71.1708 23.7687 71.4527 24.2456C71.7363 24.7215 72.3089 24.954 73.1716 24.9489C74.0074 24.9422 74.8349 24.6996 75.6596 24.2154C76.4842 23.7313 77.1064 23.1165 77.5283 22.3674L83.0866 12.5109L90.0482 12.4609Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M83.0036 37.0803C80.4403 38.4657 77.8111 39.1693 75.1192 39.1891C72.2328 39.2102 70.3037 38.4371 69.3323 36.8739C69.3127 36.8441 69.2947 36.8135 69.2767 36.7828L64.2062 28.0851C64.2241 28.1158 64.2438 28.1455 64.2618 28.1762C65.2332 29.7394 67.1622 30.5125 70.0486 30.4914C72.7322 30.4722 75.3507 29.7727 77.9078 28.3952"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M77.9063 28.3961C78.0998 28.2934 78.2906 28.1857 78.4836 28.0746C81.2209 26.4829 83.3146 24.4008 84.7665 21.8274L90.0475 12.4635L92.1841 16.1285M83.002 37.0812C83.1866 36.9816 83.3692 36.8787 83.5525 36.7732C84.7927 36.0521 85.9008 35.2303 86.8769 34.3077"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M100.77 12.385L101.19 13.105"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M103.033 18.0755C103.027 18.0658 103.021 18.0561 103.016 18.0464C102.734 17.593 102.174 17.3705 101.338 17.3772C100.503 17.3839 99.7013 17.6156 98.9295 18.0752C98.1602 18.5355 97.5439 19.1751 97.0838 19.9921L91.485 29.9201L96.5556 38.6178L99.355 33.6538"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M91.4849 29.9203L96.5555 38.618L89.5964 38.6686L84.5249 29.9693L91.4849 29.9203Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M104.108 29.8306L109.177 38.5292L102.218 38.5773L97.1477 29.8796L104.108 29.8306Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M115.655 17.9816C115.651 17.9735 115.646 17.9655 115.64 17.9558C115.357 17.5033 114.799 17.2799 113.961 17.2875C113.126 17.2942 112.324 17.5259 111.552 17.9855C110.783 18.4457 110.167 19.0854 109.707 19.9024L104.108 29.8304L109.179 38.5281L111.787 33.9031"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M119.053 11.8352C121.453 11.8174 122.987 12.4535 123.659 13.7432C124.329 15.0296 124.051 16.7624 122.825 18.9364L116.731 29.7408L109.772 29.7914L115.371 19.8634C115.833 19.0454 115.921 18.4094 115.641 17.9575C115.358 17.505 114.8 17.2816 113.962 17.2892C113.127 17.2959 112.325 17.5276 111.553 17.9872C110.784 18.4475 110.168 19.0871 109.708 19.9041L104.109 29.8322L97.1499 29.8828L102.749 19.9547C103.21 19.1368 103.299 18.5007 103.017 18.0482C102.735 17.5947 102.175 17.3723 101.339 17.3789C100.504 17.3856 99.7022 17.6173 98.9304 18.0769C98.1611 18.5372 97.5448 19.1768 97.0847 19.9939L91.4859 29.9219L84.5269 29.9725L94.4198 12.4341L100.772 12.3882L99.9999 13.7573C102.129 12.5529 104.313 11.9439 106.551 11.9277C109.059 11.9094 110.592 12.6437 111.152 14.1297C113.667 12.6183 116.3 11.8541 119.053 11.8352Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M116.73 29.7392L121.8 38.4394L114.842 38.4875L109.771 29.7898L116.73 29.7392Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M123.658 13.7441C124.328 15.0305 124.049 16.7633 122.823 18.9373L116.729 29.7418L121.8 38.4394L127.893 27.635C129.12 25.461 129.398 23.7308 128.728 22.4418C128.706 22.4005 128.684 22.3592 128.66 22.3188L123.59 13.6211C123.613 13.6615 123.637 13.7018 123.658 13.7441Z"
              stroke={stroke}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {showProgress && progress ? (
            <LoadingProgress loadedProgress={progress} />
          ) : null}
        </div>
      </div>

      <p>©2021 Arium Virtual Technologies Inc.</p>
    </div>
  );
};
