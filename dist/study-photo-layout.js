// Keep the whole image above the fixed action bar when space permits.
// Long explanations must scroll rather than turn diagnostic details into thumbnails.
export function studyPhotoHeight({photoTop,viewportBottom,actionsTop,minHeight=220,maxHeight=360,gap=12}) {
  if(![photoTop,viewportBottom,actionsTop].every(Number.isFinite))return maxHeight;
  return Math.max(minHeight,Math.min(maxHeight,Math.floor(Math.min(viewportBottom,actionsTop)-photoTop-gap)));
}
