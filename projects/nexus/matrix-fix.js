(() => {
  'use strict';
  const DATA = {
    gateway:{name:'GW-01',role:'Network edge / Gateway',status:'Normal',desc:'Routes lab traffic between fictional network segments.',telemetry:'EDGE_POLICY: DEMO_NOMINAL',links:['WEB-01','DB-01']},
    web:{name:'WEB-01',role:'Application tier / Web server',status:'Normal',desc:'Hosts a fictional demonstration web service.',telemetry:'HTTP_SERVICE: SAMPLE_OK',links:['GW-01','WS-07','SIEM']},
    db:{name:'DB-01',role:'Data tier / Database',status:'Review',desc:'Synthetic anomaly signal attached to this demo database node.',telemetry:'DB_READ_VOLUME: ABOVE_SAMPLE_BASELINE',links:['GW-01','API-02']},
    workstation:{name:'WS-07',role:'Endpoint / Workstation',status:'Review',desc:'Synthetic authentication-failure signal attached to this demo endpoint.',telemetry:'AUTH_FAIL → AUTH_FAIL → REVIEW',links:['WEB-01']},
    siem:{name:'SIEM',role:'Monitoring / Log collector',status:'Normal',desc:'Collects the sample events displayed in SOC Operations.',telemetry:'INGESTION_HEARTBEAT: SAMPLE_OK',links:['WEB-01','API-02']},
    api:{name:'API-02',role:'Application tier / App service',status:'Normal',desc:'Fictional API service node for topology exploration.',telemetry:'ASSET_HEALTH: SIMULATED',links:['DB-01','SIEM','BK-01']},
    backup:{name:'BK-01',role:'Resilience / Backup node',status:'Normal',desc:'Represents a fictional backup target; no device connection exists.',telemetry:'BACKUP_TARGET: SAMPLE_READY',links:['API-02']}
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function select(key){
    const d=DATA[key]; if(!d) return;
    document.querySelectorAll('#view-matrix [data-node]').forEach(n=>n.classList.toggle('selected',n.dataset.node===key));
    document.querySelectorAll('#view-matrix [data-matrix-node]').forEach(b=>b.classList.toggle('selected',b.dataset.matrixNode===key));
    const sel=document.getElementById('networkSelection');
    if(sel) sel.textContent=d.name+' · '+d.links.length+' adjacent lab nodes';
    const box=document.getElementById('nodeDetails');
    if(box) box.innerHTML='<span class="eyebrow">SELECTED ASSET</span><h2 style="margin:8px 0 4px">'+esc(d.name)+'</h2><p class="muted">'+esc(d.role)+'</p><div class="result-item"><b>Demo status</b><span class="tag '+(d.status==='Review'?'amber':'green')+'">'+esc(d.status)+'</span></div><div class="result-item"><b>Connected lab nodes</b><span>'+d.links.map(esc).join(' · ')+'</span></div><p class="muted" style="font-size:12px">'+esc(d.desc)+'</p><div class="network-telemetry"><b>Sample telemetry</b><code>'+esc(d.telemetry)+'</code></div>';
  }
  window.nexusSelectNode=select;
  document.addEventListener('click',e=>{const el=e.target.closest('#view-matrix [data-node],#view-matrix [data-matrix-node]');if(!el)return;e.preventDefault();e.stopImmediatePropagation();select(el.dataset.node||el.dataset.matrixNode);},true);
  document.addEventListener('pointerup',e=>{if(e.pointerType!=='touch'&&e.pointerType!=='pen')return;const el=e.target.closest('#view-matrix [data-node],#view-matrix [data-matrix-node]');if(el){e.preventDefault();select(el.dataset.node||el.dataset.matrixNode);}},true);
  document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const el=e.target.closest('#view-matrix [data-node],#view-matrix [data-matrix-node]');if(el){e.preventDefault();select(el.dataset.node||el.dataset.matrixNode);}},true);
})();
