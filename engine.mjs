export const IDS = ['A','B','C'];
export const SAMPLE = '4 A B C\n3 B C A\n2 C B A';
export const CYCLE = '3 A B C\n3 B C A\n3 C A B';

export function parse(text) {
  if (typeof text !== 'string' || text.length > 20000) throw Error('Use at most 20,000 characters.');
  const rows = text.trim().split(/\r?\n/).filter(x=>x.trim());
  if (!rows.length || rows.length > 100) throw Error('Enter 1–100 ballot groups.');
  let total=0;
  const groups=rows.map((line,i)=>{
    const [count,...rank]=line.trim().split(/\s+/);
    if (!/^[1-9]\d*$/.test(count) || !Number.isSafeInteger(+count) || +count>1000000)
      throw Error(`Row ${i+1}: count must be an integer from 1 to 1,000,000.`);
    if(rank.length!==3 || new Set(rank).size!==3 || rank.some(x=>!IDS.includes(x)))
      throw Error(`Row ${i+1}: rank A, B and C exactly once.`);
    total+=+count;
    return {count:+count,rank};
  });
  if(total>1000000) throw Error('Use at most 1,000,000 total ballots.');
  return groups;
}

export function analyze(text) {
  const groups=parse(text), total=groups.reduce((s,g)=>s+g.count,0);
  const matrix=Object.fromEntries(IDS.map(a=>[a,Object.fromEntries(IDS.map(b=>[b,0]))]));
  for(const g of groups) for(const a of IDS) for(const b of IDS)
    if(g.rank.indexOf(a)<g.rank.indexOf(b)) matrix[a][b]+=g.count;
  const first=Object.fromEntries(IDS.map(a=>[a,groups.reduce((s,g)=>s+(g.rank[0]===a?g.count:0),0)]));
  const max=Math.max(...Object.values(first));
  const plurality=IDS.filter(a=>first[a]===max);
  const condorcet=IDS.find(a=>IDS.every(b=>a===b||matrix[a][b]>matrix[b][a]))||null;
  const rounds=[];
  let active=[...IDS], irv=null;
  while(active.length){
    const counts=Object.fromEntries(active.map(a=>[a,0]));
    for(const g of groups) counts[g.rank.find(a=>active.includes(a))]+=g.count;
    const winner=active.find(a=>counts[a]>total/2);
    if(winner){rounds.push({active:[...active],counts,winner});irv={status:'winner',winner,votes:counts[winner]};break;}
    const low=Math.min(...Object.values(counts));
    const tied=active.filter(a=>counts[a]===low);
    if(tied.length>1){rounds.push({active:[...active],counts,tied});irv={status:'unresolved-tie',tied};break;}
    rounds.push({active:[...active],counts,eliminated:tied[0]});
    active=active.filter(a=>a!==tied[0]);
  }
  const cycle=matrix.A.B>matrix.B.A&&matrix.B.C>matrix.C.B&&matrix.C.A>matrix.A.C
    ? ['A','B','C','A'] : matrix.B.A>matrix.A.B&&matrix.A.C>matrix.C.A&&matrix.C.B>matrix.B.C
      ? ['B','A','C','B'] : null;
  return {schema:'quorumglass-audit/v1',policy:'Complete rankings; strict majority; stop on elimination ties; no arbitrary tie-break.',groups,total,first,plurality,matrix,condorcet,irv,rounds,cycle};
}
