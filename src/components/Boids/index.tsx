import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, useMemo, memo } from "react";
import { boidsDb } from "../../db";

import { Mesh, Vector3, Font, TextGeometry } from "three";

import {
  betterText,
  entropyText,
  chanceText,
  gainText,
  enoughText,
} from "./text";

import helvetiker_bold from "../../assets/fonts/helvetiker_bold.typeface.json";

const FrontMat = memo(({ spaceId }: { spaceId: string }) => {
  return (
    <>
      {spaceId === "better" && (
        <meshBasicMaterial attach="material" color={0xe75480} />
      )}
      {spaceId === "chance" && (
        <meshBasicMaterial attach="material" color={0x2ea35d} />
      )}
      {spaceId === "gain" && (
        <meshBasicMaterial attach="material" color={0x84f4f8} />
      )}
      {spaceId === "enough" && (
        <meshBasicMaterial attach="material" color={0xffbca46} />
      )}
      {spaceId === "entropy" && (
        <meshBasicMaterial attach="material" color={0x0097d0} />
      )}
    </>
  );
});

const SideMat = memo(({ spaceId }: { spaceId: string }) => {
  return (
    <>
      {spaceId === "better" && (
        <meshBasicMaterial attach="material" color={0x00ff00} />
      )}
      {spaceId === "chance" && (
        <meshBasicMaterial attach="material" color={0xa4f5f8} />
      )}
      {spaceId === "gain" && (
        <meshBasicMaterial attach="material" color={0xfaf221} />
      )}
      {spaceId === "enough" && (
        <meshBasicMaterial attach="material" color={0x577695} />
      )}
      {spaceId === "entropy" && (
        <meshBasicMaterial attach="material" color={0xff81ac} />
      )}
    </>
  );
});

const SideMatText = memo(({ spaceId }: { spaceId: string }) => {
  return (
    <>
      {spaceId === "better" && (
        <meshBasicMaterial attach="material" color={0xe75480} />
      )}
      {spaceId === "chance" && (
        <meshBasicMaterial attach="material" color={0x2ea35d} />
      )}
      {spaceId === "gain" && (
        <meshBasicMaterial attach="material" color={0x84f4f8} />
      )}
      {spaceId === "enough" && (
        <meshBasicMaterial attach="material" color={0xffbca46} />
      )}
      {spaceId === "entropy" && (
        <meshBasicMaterial attach="material" color={0x0097d0} />
      )}
    </>
  );
});

const FrontMatText = memo(({ spaceId }: { spaceId: string }) => {
  return (
    <>
      {spaceId === "better" && (
        <meshBasicMaterial attach="material" color={0x00ff00} />
      )}
      {spaceId === "chance" && (
        <meshBasicMaterial attach="material" color={0xa4f5f8} />
      )}
      {spaceId === "gain" && (
        <meshBasicMaterial attach="material" color={0xfaf221} />
      )}
      {spaceId === "enough" && (
        <meshBasicMaterial attach="material" color={0x577695} />
      )}
      {spaceId === "entropy" && (
        <meshBasicMaterial attach="material" color={0xff81ac} />
      )}
    </>
  );
});

const Boid = ({ index, spaceId }: { index: number; spaceId: string }) => {
  const boidRef = useRef<Mesh>(null);
  const [desiredPosition, setDesiredPosition] = useState<Vector3>(
    new Vector3()
  );

  const [oldPosition, setOldPosition] = useState<Vector3>(new Vector3());
  const lerpVal = useRef(0);

  useEffect(() => {
    console.log("boid index: ", index);
    const boidReference = boidsDb.ref(`${spaceId}/boids/${index}`);

    boidReference.on("value", (snapshot) => {
      let boidInfo = snapshot.val();
      let p = boidInfo.position;
      setDesiredPosition(new Vector3(p.x, p.y, p.z));

      if (boidRef.current) {
        // console.log("setting old position");
        setOldPosition(boidRef.current.position);
      }
      lerpVal.current = 0;
    });
  }, [index, spaceId]);

  useFrame((_, delta) => {
    if (!boidRef.current || !desiredPosition) return;
    boidRef.current.position.lerpVectors(
      oldPosition,
      desiredPosition,
      lerpVal.current + delta
    );

    lerpVal.current = lerpVal.current + delta;
  });

  const [font, setFont] = useState<Font | null>(null);

  useEffect(() => {
    const font = new Font(helvetiker_bold);
    setFont(font);
  }, []);

  const [textGeometryRef, setTextGeometry] = useState<TextGeometry | null>(
    null
  );

  useEffect(() => {
    // "fix" side normals by removing z-component of normals for side faces
    // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)
    if (!textGeometryRef) return;

    textGeometryRef.computeVertexNormals();
  }, [textGeometryRef]);

  const [boidText, setBoidText] = useState("");
  useEffect(() => {
    let boidText = "";

    let sourceText: string[] = [];
    if (spaceId === "better") {
      sourceText = betterText;
    }
    if (spaceId === "chance") {
      sourceText = chanceText;
    }
    if (spaceId === "gain") {
      sourceText = gainText;
    }
    if (spaceId === "enough") {
      sourceText = enoughText;
    }
    if (spaceId === "entropy") {
      sourceText = entropyText;
    }
    if (sourceText[index]) {
      let boidTextParts = sourceText[index].split(":");
      boidText = boidTextParts[0];
    }

    setBoidText(boidText);
  }, [index, spaceId]);

  const geometryArgs = useMemo(
    () => [
      boidText,
      {
        font: font,
        size: 0.1 + Math.random() * 2,
        height: Math.random(),
        curveSegments: 3,
        bevelEnabled: false,
        bevelThickness: 0.2,
        bevelSize: 0.2,
        bevelOffset: 0,
        bevelSegments: 5,
      },
    ],
    [boidText, font]
  );
  if (!font) return null;

  return (
    <mesh ref={boidRef}>
      <textGeometry
        ref={setTextGeometry}
        // @ts-ignore
        args={geometryArgs}
      />

      <FrontMatText spaceId={spaceId} />
      <SideMatText spaceId={spaceId} />
    </mesh>
  );
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

const Monoliths = ({ spaceId }: { spaceId: string }) => {
  const [monolithPositions, setMonolithPotisions] = useState<any>(null);

  useEffect(() => {
    let monoliths: any[] = [];
    for (let i = 0; i < 12; i++) {
      monoliths.push(i);
    }
    setMonolithPotisions(monoliths);
  }, []);

  return (
    <>
      {monolithPositions &&
        monolithPositions.map((item: any, index: number) => (
          <Monolith spaceId={spaceId} key={index} index={index} />
        ))}
    </>
  );
};

const Monolith = ({ index, spaceId }: { index: number; spaceId: string }) => {
  const ref = useRef<Mesh>(null);
  const [desiredPosition, setDesiredPosition] = useState<Vector3>(
    new Vector3()
  );

  const upVec = useMemo(() => {
    const newVec = new Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );
    newVec.normalize();
    return newVec;
  }, []);
  const [randScale] = useState(Math.random() * 3);

  useEffect(() => {
    console.log("monolith index: ", index);
    const dbRef = boidsDb.ref(`${spaceId}/monoliths/${index}`);

    dbRef.on("value", (snapshot) => {
      let boidInfo = snapshot.val();
      let p = boidInfo.position;
      setDesiredPosition(new Vector3(p.x, p.y, p.z));
    });
  }, [index, spaceId]);

  useFrame((_, delta) => {
    if (!ref.current || !desiredPosition) return;
    ref.current.position.set(
      desiredPosition.x,
      desiredPosition.y,
      desiredPosition.z
    );

    ref.current.rotateOnAxis(upVec, 0.0005);
  });

  return (
    <>
      <mesh scale={[randScale, randScale, randScale]} ref={ref}>
        {spaceId === "better" && <icosahedronGeometry args={[12, 1]} />}
        {spaceId === "chance" && <boxGeometry args={[10, 20, 30]} />}
        {spaceId === "gain" && <tetrahedronGeometry args={[20, 2]} />}
        {spaceId === "enough" && <cylinderGeometry args={[5, 5, 10, 3]} />}
        {spaceId === "entropy" && <icosahedronGeometry args={[12, 2]} />}

        <meshNormalMaterial wireframe />
      </mesh>
    </>
  );
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

const AdditionalText = ({ spaceId }: { spaceId: string }) => {
  const [textElements, setTextElements] = useState<number[]>([]);

  useEffect(() => {
    let q = [];
    for (let i = 40; i < 40 + 60; i++) {
      q.push(i);
    }
    setTextElements(q);
  }, []);

  return (
    <>
      {textElements &&
        textElements.map((item: any, index: number) => (
          <AdditionalTextElement key={index} spaceId={spaceId} index={index} />
        ))}
    </>
  );
};

const AdditionalTextElement = ({
  spaceId,
  index,
}: {
  spaceId: string;
  index: number;
}) => {
  const [initialPosition] = useState(
    new Vector3(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 200
    )
  );

  const speed = useRef(
    new Vector3(
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    )
  );

  const meshRef = useRef<Mesh>(null);

  const [font, setFont] = useState<Font | null>(null);

  useEffect(() => {
    const font = new Font(helvetiker_bold);
    setFont(font);
  }, []);

  const [text, setText] = useState("");
  useEffect(() => {
    let t = "";

    let sourceText: string[] = [];
    if (spaceId === "better") {
      sourceText = betterText;
    }
    if (spaceId === "chance") {
      sourceText = chanceText;
    }
    if (spaceId === "gain") {
      sourceText = gainText;
    }
    if (spaceId === "enough") {
      sourceText = enoughText;
    }
    if (spaceId === "entropy") {
      sourceText = entropyText;
    }
    if (sourceText[index]) {
      t = sourceText[index].split(":")[1];
    }

    setText(t);
  }, [index, spaceId]);

  useEffect(() => {
    let interval = setInterval(() => {
      speed.current.set(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      );
    }, Math.random() * 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current && speed.current) {
      meshRef.current.position.add(speed.current);
    }
  });

  const geometryArgs = useMemo(
    () => [
      text,
      {
        font: font,
        size: 0.1 + Math.random() * 1,
        height: Math.random() * 0.25,
        curveSegments: 3,
        bevelEnabled: false,
        bevelThickness: 0.2,
        bevelSize: 0.2,
        bevelOffset: 0,
        bevelSegments: 5,
      },
    ],
    [text, font]
  );
  if (!font) return null;

  return (
    <mesh position={initialPosition} ref={meshRef}>
      <textGeometry
        // @ts-ignore
        args={geometryArgs}
      />
      <FrontMat spaceId={spaceId} />
      <SideMat spaceId={spaceId} />
    </mesh>
  );
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

export const Boids = ({ spaceId }: { spaceId: string }) => {
  const [boidState, setBoidState] = useState<any>(null);

  useEffect(() => {
    let boids: any[] = [];
    for (let i = 0; i < 30; i++) {
      boids.push(i);
    }
    setBoidState(boids);
  }, []);

  return (
    <>
      {boidState &&
        boidState.map((item: any, index: number) => (
          <Boid spaceId={spaceId} key={index} index={index} />
        ))}
    </>
  );
};

const MaxxiValentinaElements = ({ spaceId }: { spaceId: string }) => {
  if (
    spaceId === "better" ||
    spaceId === "chance" ||
    spaceId === "gain" ||
    spaceId === "enough" ||
    spaceId === "entropy"
  ) {
    return (
      <>
        <Monoliths spaceId={spaceId} />
        <Boids spaceId={spaceId} />
        <AdditionalText spaceId={spaceId} />
      </>
    );
  } else {
    return null;
  }
};

export default MaxxiValentinaElements;
