// Region membership only filters the existing learning data; never changes taxonomy.
export function validateRegions(data, speciesIds) {
  if (!data || data.version!==1 || data.recentDays!==30 || !Array.isArray(data.regions) || data.regions.length>512) throw Error('Invalid regional snapshot');
  const seen=new Set();
  const regions=data.regions.map(r=>{
    if(!r || !/^[A-Z]{2}(?:-[A-Z0-9]{1,4})?$/.test(r.code) || seen.has(r.code) || !['nameDe','nameEn'].every(k=>typeof r[k]==='string'&&r[k].length>0&&r[k].length<=150))throw Error('Invalid region');
    seen.add(r.code);
    const region={code:r.code,country:r.code.split('-')[0],nameDe:r.nameDe,nameEn:r.nameEn};
    for(const mode of ['all','recent']){
      const x=r[mode];if(x===null||x===undefined){region[mode]=null;continue;}
      if(!Array.isArray(x.ids)||x.ids.length>speciesIds.size||!x.ids.every(id=>speciesIds.has(id))||new Set(x.ids).size!==x.ids.length||typeof x.updatedAt!=='string'||!Number.isFinite(Date.parse(x.updatedAt))||Date.parse(x.updatedAt)>Date.now()+300000||!Number.isInteger(x.reportedTaxa)||x.reportedTaxa<x.ids.length)throw Error('Invalid regional species list');
      region[mode]={ids:[...x.ids],reportedTaxa:x.reportedTaxa,updatedAt:x.updatedAt};
    }
    return region;
  });
  const countries=regions.filter(r=>!r.code.includes('-')).map(r=>({code:r.code,nameDe:r.nameDe,nameEn:r.nameEn}));
  return {regions,countries,recentDays:30};
}
export function regionalSelection(data, code, mode) {
  if(!code)return null;
  return data?.regions.find(r=>r.code===code)?.[mode]||null;
}
export function regionAllows(data,code,mode,id){
  return !code || !!regionalSelection(data,code,mode)?.ids.includes(id);
}
export const regionalDataStale=(list,now=Date.now())=>!list||now-Date.parse(list.updatedAt)>3*86400000;
