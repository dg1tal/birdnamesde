// Keep the whole image above the fixed action bar when space permits.
// Long explanations must scroll rather than turn diagnostic details into thumbnails.
export function studyPhotoHeight({photoTop,viewportBottom,actionsTop,minHeight=220,maxHeight=360,gap=12}) {
  if(![photoTop,viewportBottom,actionsTop].every(Number.isFinite))return maxHeight;
  return Math.max(minHeight,Math.min(maxHeight,Math.floor(Math.min(viewportBottom,actionsTop)-photoTop-gap)));
}

// Introduction cards must budget for every image row, captions and card padding.
// Keep a readable image floor; long text can scroll while the action bar stays visible.
export function introductionPhotoHeight({photoTop,viewportBottom,actionsTop,overhead=0,rows=1,minHeight=160,maxHeight=340,gap=12}){
 if(![photoTop,viewportBottom,actionsTop,overhead,rows].every(Number.isFinite)||rows<1)return maxHeight;
 const available=Math.min(viewportBottom,actionsTop)-photoTop-Math.max(0,overhead)-gap;
 return Math.max(minHeight,Math.min(maxHeight,Math.floor(available/rows)));
}
