export const makeTheme = (dark) => ({
  bg: dark ? "#141414" : "#E8E6E1", 
  bgDeep: dark ? "#0e0e0e" : "#DEDAD4",
  card: dark ? "#1E1E1E" : "#ECEAE5", 
  cardHigh: dark ? "#252525" : "#F2F0EB",
  white: dark ? "#1E1E1E" : "#FFFFFF", 
  black: dark ? "#F0EEE9" : "#141414",
  grey: dark ? "#666" : "#888", 
  lightGrey: dark ? "#3a3a3a" : "#C8C5BF",
  accent: dark ? "#E0DDD7" : "#1A1A1A", 
  accentSoft: dark ? "#2a2a2a" : "#D0CEC9",
  orange: "#E8500A", 
  sdark: dark ? "rgba(0,0,0,0.5)" : "rgba(180,176,168,0.8)",
  slight: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)", 
  dark,
});

export const getShadow = (t) => ({
  card: `8px 8px 24px ${t.sdark}, -4px -4px 14px ${t.slight}`,
  inset: `inset 5px 5px 14px ${t.sdark}, inset -3px -3px 10px ${t.slight}`,
  btn: `6px 6px 18px ${t.sdark}, -3px -3px 10px ${t.slight}`,
  raised: `12px 12px 32px ${t.sdark}, -6px -6px 18px ${t.slight}`,
});

export const GS = (t) => `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  body{background:${t.bg};font-family:'Barlow',sans-serif;color:${t.black};min-height:100vh;overscroll-behavior:none;transition:background 0.4s;}
  ::-webkit-scrollbar{width:0;height:0;}
  input,textarea,select{font-family:'Barlow',sans-serif;outline:none;border:none;background:transparent;color:${t.black};}
  button{font-family:'Barlow',sans-serif;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .page{opacity:1;}
  .spin{animation:spin 1s linear infinite;}
`;
