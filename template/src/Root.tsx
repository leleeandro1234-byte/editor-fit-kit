import { Composition, Still } from "remotion";
import { ReelAd, REEL_DURATION } from "./ReelAd";
import { CAROUSEL, SLIDES } from "./Carousel";
import { EditorFit, EF_DURATION, EF_FPS } from "./EditorFit";
import { MarketingStory, MS_DURATION, MS_FPS } from "./MarketingStory";
import { AdEdit, AD_DURATIONS, AD_FPS } from "./AdEdit";
import { EditorFitV, EFV_DURATION, EFV_FPS } from "./EditorFitV";

export const Root: React.FC = () => (
  <>
    <Composition id="ReelAd" component={ReelAd} durationInFrames={REEL_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="EditorFit" component={EditorFit} durationInFrames={EF_DURATION} fps={EF_FPS} width={1920} height={1080} />
    <Composition id="EditorFitV" component={EditorFitV} durationInFrames={EFV_DURATION} fps={EFV_FPS} width={1080} height={1920} />
    {(["2714", "2715", "2717"] as const).map((id) => (
      <Composition key={id} id={`Ad${id}`} component={AdEdit} defaultProps={{ id }} durationInFrames={Math.ceil(AD_DURATIONS[id] * AD_FPS)} fps={AD_FPS} width={1080} height={1920} />
    ))}
    {(["2714", "2715", "2717"] as const).map((id) => (
      <Composition key={id} id={`Ad${id}B`} component={AdEdit} defaultProps={{ id, band: true }} durationInFrames={Math.ceil(AD_DURATIONS[id] * AD_FPS)} fps={AD_FPS} width={1080} height={1920} />
    ))}
    <Composition id="MarketingStory" component={MarketingStory} durationInFrames={MS_DURATION} fps={MS_FPS} width={1080} height={1920} />
    {SLIDES.map((S, i) => (
      <Still key={i} id={`slide-${i + 1}`} component={S} width={CAROUSEL.width} height={CAROUSEL.height} />
    ))}
  </>
);
