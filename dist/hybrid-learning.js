import {regionalSelection} from './regions.js?v=20261105-catalog1';
const DAY=86400000;
export const FREQUENCY_GROUPS=['frequent','medium','rare'];
export function frequencyGroups(value){return Array.isArray(value)?FREQUENCY_GROUPS.filter(g=>value.includes(g)):['frequent','medium'];}
export function frequencyLabel(group,english=false){return ({frequent:['Häufig','Frequent'],medium:['Mittel','Medium'],rare:['Selten','Rare']})[group]?.[+english]||'';}
export function seasonAt(now=new Date()) {return ['winter','winter','spring','spring','spring','summer','summer','summer','autumn','autumn','autumn','winter'][now.getMonth()];}
export function seasonLabel(season,english=false){return ({winter:['Winter (Dez–Feb)','Winter (Dec–Feb)'],spring:['Frühjahr (Mär–Mai)','Spring (Mar–May)'],summer:['Sommer (Jun–Aug)','Summer (Jun–Aug)'],autumn:['Herbst (Sep–Nov)','Autumn (Sep–Nov)']})[season]?.[+english]||'';}
export function validSeasonalDataset(d){
 return !!d&&typeof d==='object'&&!Array.isArray(d)&&typeof d.id==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,99}$/.test(d.id)&&['eBird Basic Dataset','eBird histogram exports'].includes(d.source)&&typeof d.release==='string'&&d.release.length>0&&d.release.length<=80&&typeof d.period==='string'&&/^\d{4}–\d{4}$/.test(d.period);
}
export function seasonalDatasetText(d,english=false){
 if(!validSeasonalDataset(d))return english?'Data source was not stored for this round.':'Die Datenquelle wurde für diese Runde nicht gespeichert.';
 return `${d.source} · ${english?'release':'Ausgabe'} ${d.release} · ${d.period}`;
}
export function regionalSnapshot(h){
 return {season:h.season,seasonalReady:h.seasonalReady,seasonalRequested:h.seasonalRequested,selectedGroups:h.frequencyGroups?[...h.selectedGroups]:null,additions:structuredClone(h.additions),seasonalDataset:h.seasonalDataset?structuredClone(h.seasonalDataset):null};
}
export function validateSeasonal(data,ids){
 if(data?.version!==1||!Array.isArray(data.regions))throw Error('Invalid seasonal data');
 if(data.dataset!=null&&!validSeasonalDataset(data.dataset))throw Error('Invalid seasonal dataset metadata');
 const seen=new Set();
 for(const r of data.regions){
  if(typeof r.code!=='string'||seen.has(r.code)||!r.seasons)throw Error('Invalid seasonal region');seen.add(r.code);
  for(const [key,s] of Object.entries(r.seasons)){
   if(!['winter','spring','summer','autumn'].includes(key)||!Number.isInteger(s.sample)||s.sample<0||!Number.isInteger(s.years)||s.years<0||s.years>5||!Array.isArray(s.ids)||new Set(s.ids).size!==s.ids.length||!s.ids.every(id=>ids.has(id)))throw Error('Invalid seasonal list');
   if(s.groups!=null){
    if(Object.keys(s.groups).length!==3||!FREQUENCY_GROUPS.every(g=>Array.isArray(s.groups[g])&&s.groups[g].every(id=>ids.has(id))))throw Error('Invalid frequency groups');
    const all=FREQUENCY_GROUPS.flatMap(g=>s.groups[g]);
    const standard=[...s.groups.frequent,...s.groups.medium];
    if(new Set(all).size!==all.length||standard.length!==s.ids.length||!standard.every(id=>s.ids.includes(id)))throw Error('Overlapping or inconsistent frequency groups');
   }
  }
 }
 return data;
}
export function validCurrentRecords(region,ids,now=Date.now()){
 if(!region||!Array.isArray(region.records))return [];
 const stamp=Date.parse(region.updatedAt);if(!Number.isFinite(stamp)||stamp>now+300000||now-stamp>3*DAY)return [];
 const result=new Map();
 for(const r of region.records){
  if(!r||typeof r!=='object')continue;
  const observed=Date.parse(r.observedOn+'T00:00:00Z'),expires=Date.parse(r.expiresOn+'T00:00:00Z');
  if(!ids.has(r.id)||!/^\d{4}-\d{2}-\d{2}$/.test(r.observedOn)||!/^\d{4}-\d{2}-\d{2}$/.test(r.expiresOn)||!Number.isFinite(observed)||!Number.isFinite(expires)||observed>now||expires<=now||expires-observed!==14*DAY||new Date(observed).toISOString().slice(0,10)!==r.observedOn||new Date(expires).toISOString().slice(0,10)!==r.expiresOn)continue;
  if(!result.has(r.id)||result.get(r.id).observedOn<r.observedOn)result.set(r.id,{id:r.id,observedOn:r.observedOn,expiresOn:r.expiresOn});
 }
 return [...result.values()];
}
export function hybridSelection(regions,seasonal,current,cfg,ids,now=new Date(),includeReports=true){
 const season=seasonAt(now),list=seasonal?.regions.find(r=>r.code===cfg.region)?.seasons[season];
 const seasonalReady=cfg.regionMode==='seasonal'&&!!list&&list.sample>=300&&list.years>=3;
 const fallback=regionalSelection(regions,cfg.region,cfg.regionMode==='recent'?'recent':'all');
 const selectedGroups=frequencyGroups(cfg.frequencyGroups),groups=seasonalReady?list.groups||null:null;
 const base=cfg.region?(seasonalReady?(groups?selectedGroups.flatMap(g=>groups[g]):list.ids):fallback?.ids||[]):[];
 const available=current?.regions?.find(r=>r?.code===cfg.region);
 const currentFresh=!!available&&Number.isFinite(Date.parse(available.updatedAt))&&now.getTime()-Date.parse(available.updatedAt)<=3*DAY&&Date.parse(available.updatedAt)<=now.getTime()+300000;
 const records=cfg.region&&includeReports?validCurrentRecords(available,ids,now.getTime()):[];
 const additions=records.filter(r=>!base.includes(r.id));
 return {ids:[...new Set([...base,...additions.map(r=>r.id)])],baseIds:base,additions,season,frequencyGroups:groups,selectedGroups,seasonalReady,seasonalRequested:cfg.regionMode==='seasonal',seasonalDataset:cfg.regionMode==='seasonal'&&seasonal?.dataset?structuredClone(seasonal.dataset):null,sample:list?.sample||0,years:list?.years||0,available:!!cfg.region&&(seasonalReady||!!fallback||additions.length>0),currentFresh,currentUpdatedAt:currentFresh?available.updatedAt:null};
}
