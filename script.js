/* ===== 상수 ===== */
const H          = 4;        // 풍력 H_vir (고정)
const A          = 0.9;      // 가용률
const kFactor    = 1.066;    // 시간 가중치 Σk_hour
const unitPrice  = 18_000;   // 단가 (원/VIC)

let windType = null;         // 'onshore' | 'offshore'

/* ===== 1단계 : 설비 유형 선택 ===== */
document.querySelectorAll(".big-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    windType = btn.dataset.type;

    // 해상 풍력 선택 시 거리 입력칸 표시
    const distWrap = document.getElementById("distanceWrap");
    distWrap.classList.toggle("hidden", windType !== "offshore");

    document.getElementById("step1").classList.add("hidden");
    document.getElementById("step2").classList.remove("hidden");
  });
});

/* ===== 2단계 : 계산 ===== */
document.getElementById("calcBtn").addEventListener("click",()=>{
  const P = parseFloat(document.getElementById("capacity").value || 0);  // MW
  const E = parseFloat(document.getElementById("energy").value   || 0);  // MWh
  if(!P || !E){ alert("용량과 발전량을 모두 입력하세요"); return; }

  /* --- 가중치 W 결정 --- */
  let W;
  if(windType === "onshore"){
    W = 1.3;
  }else{                                 // offshore
    const d = parseFloat(document.getElementById("distance").value || 0);
    if(!d && d!==0){ alert("해상 풍력은 거리(km)를 입력해야 합니다"); return; }
    if(d <= 5)        W = 1.3;      // 연안(≤5 km)
    else if(d <=10)   W = 1.4;      // 5~10 km
    else              W = 1.5;      // 10 km 초과
  }

  /* --- CF & VIC 발급량 --- */
  const CF       = E / (P * 720);                       // 월 이용률
  const vicMonth = H * P * A * CF * W * kFactor * 720;  // 발급량

  /* --- 의무 VIC (= CF × E_actual) --- */
  const vicObl   = CF * E;

  /* --- 총 수익 --- */
  const revenue  = (vicMonth - vicObl) * unitPrice;

  /* --- 결과 표시 --- */
  const result = document.getElementById("result");
  result.innerHTML =
    `설비 유형&nbsp;: <b>${windType==="onshore"?"육상 풍력":"해상 풍력"}</b><br>`+
    (windType==="offshore" ?
       `연안 거리&nbsp;: <b>${document.getElementById("distance").value} km</b><br>` : "" )+
    `가중치 W&nbsp;&nbsp;: <b>${W}</b><br><br>`+
    `월간 VIC 발급량&nbsp;: <b>${vicMonth.toFixed(3)}</b> VIC<br>`+
    `월간 VIC 의무량&nbsp;: <b>${vicObl.toFixed(3)}</b> VIC<br>`+
    `월간 총 수익&nbsp;&nbsp;&nbsp;: <b>${revenue.toLocaleString()} 원</b>`;

  result.classList.remove("hidden");
});
