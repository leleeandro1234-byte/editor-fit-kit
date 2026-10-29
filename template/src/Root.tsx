import { Composition } from "remotion";
import { Starter } from "./Starter";
import { DURATION_SECONDS, FPS } from "./config";

export const Root: React.FC = () => (
  <Composition id="Starter" component={Starter} durationInFrames={Math.ceil(DURATION_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
);
