
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const DEFAULT_CLAN = process.env.CLAN_TAG || "#2GYLPCRRR";
const OFFICIAL = "https://api.clashofclans.com/v1";
const CK = "https://api.clashk.ing";

function enc(tag){ return encodeURIComponent(tag.startsWith("#") ? tag : "#"+tag); }

async function getJson(url, headers={}) {
  const r = await fetch(url, {headers});
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

// Official Supercell API is preferred when COC_API_TOKEN is configured.
// ClashKing is used as a no-key fallback for richer historical statistics.
async function official(endpoint){
  return getJson(OFFICIAL + endpoint, {
    Authorization: `Bearer ${process.env.COC_API_TOKEN}`,
    Accept: "application/json"
  });
}
async function clashking(endpoint){ return getJson(CK + endpoint); }

app.get("/api/config", (_,res)=>res.json({clanTag:DEFAULT_CLAN, official:!!process.env.COC_API_TOKEN}));

app.get("/api/clan", async (req,res)=>{
  const tag=req.query.tag || DEFAULT_CLAN;
  try{
    if(process.env.COC_API_TOKEN) return res.json(await official(`/clans/${enc(tag)}`));
    return res.json(await clashking(`/clan/${enc(tag)}/basic`));
  }catch(e){res.status(502).json({error:e.message});}
});

app.get("/api/members", async (req,res)=>{
  const tag=req.query.tag || DEFAULT_CLAN;
  try{
    if(process.env.COC_API_TOKEN) return res.json(await official(`/clans/${enc(tag)}/members?limit=50`));
    const basic=await clashking(`/clan/${enc(tag)}/basic`);
    // ClashKing basic includes member data in many deployments; if not, return it unchanged.
    return res.json({items: basic.memberList || basic.members || []});
  }catch(e){res.status(502).json({error:e.message});}
});

app.get("/api/warlog", async (req,res)=>{
  const tag=req.query.tag || DEFAULT_CLAN;
  try{
    if(process.env.COC_API_TOKEN) return res.json(await official(`/clans/${enc(tag)}/warlog?limit=50`));
    return res.json(await clashking(`/war/${enc(tag)}/previous`));
  }catch(e){res.status(502).json({error:e.message});}
});

app.get("/api/currentwar", async (req,res)=>{
  const tag=req.query.tag || DEFAULT_CLAN;
  try{
    if(process.env.COC_API_TOKEN) return res.json(await official(`/clans/${enc(tag)}/currentwar`));
    return res.json(await clashking(`/war/${enc(tag)}/basic`));
  }catch(e){res.status(502).json({error:e.message});}
});

app.get("/api/cwl", async (req,res)=>{
  const tag=req.query.tag || DEFAULT_CLAN;
  try{
    if(process.env.COC_API_TOKEN) {
      const group=await official(`/clans/${enc(tag)}/currentwar/leaguegroup`);
      const wars=[];
      for(const wt of (group.rounds||[]).flatMap(r=>r.warTags||[]).filter(Boolean).slice(0,7)){
        try{ wars.push(await official(`/clanwarleagues/wars/${enc(wt)}`)); }catch{}
      }
      return res.json({group,wars});
    }
    return res.json(await clashking(`/cwl/${enc(tag)}/group`));
  }catch(e){res.status(502).json({error:e.message});}
});

app.get("/api/player/:tag", async (req,res)=>{
  try{
    if(process.env.COC_API_TOKEN) return res.json(await official(`/players/${enc(req.params.tag)}`));
    return res.json(await clashking(`/player/${enc(req.params.tag)}/stats`));
  }catch(e){res.status(502).json({error:e.message});}
});

app.get("/api/player/:tag/warhits", async (req,res)=>{
  try{return res.json(await clashking(`/player/${enc(req.params.tag)}/warhits`));}
  catch(e){res.status(502).json({error:e.message});}
});

app.get("/api/player/:tag/legends", async (req,res)=>{
  try{return res.json(await clashking(`/player/${enc(req.params.tag)}/legends`));}
  catch(e){res.status(502).json({error:e.message});}
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Clash Command Center running on port ${PORT}`);
});
