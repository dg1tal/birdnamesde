// Visual viewport coordinates also cover browsers that pan rather than resize
// the layout viewport when their software keyboard opens.
export function studyViewportMetrics({layoutHeight,viewportHeight=layoutHeight,offsetTop=0,actionsHeight=74,gap=12}) {
  const top=Math.max(0,offsetTop);
  const bottom=Math.min(layoutHeight,top+viewportHeight);
  const inset=Math.max(0,layoutHeight-bottom);
  return {top,bottom,inset,padding:inset+actionsHeight+gap};
}

// Scroll only when necessary. Oversized feedback starts with its result heading;
// it remains freely scrollable instead of trying to fit every detail at once.
export function studyScrollDelta({top,bottom,visibleTop,visibleBottom,gap=12}) {
  const start=visibleTop+gap,end=visibleBottom-gap;
  if(end<=start)return 0;
  if(top<start||bottom-top>end-start)return top-start;
  return bottom>end?bottom-end:0;
}
