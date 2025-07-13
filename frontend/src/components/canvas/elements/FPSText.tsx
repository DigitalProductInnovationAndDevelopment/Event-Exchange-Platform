import React, { useEffect, useRef, useState } from "react";
import { Text } from "react-konva";
import Konva from "konva";

type FPSTextProps = {
  layer: React.RefObject<Konva.Layer | null>;
};

function FPSText({ layer }: FPSTextProps) {
  const animRef = useRef<Konva.Animation | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!layer.current) return;

    animRef.current = new Konva.Animation(frame => {
      setText("FPS: " + frame?.frameRate.toFixed(1));
    }, layer.current);

    animRef.current.start();

    return () => {
      animRef.current?.stop();
    };
  }, [layer]);

  return <Text text={text} fontSize={16} fill="black" />;
}

export default FPSText;
