<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>КУРОВОЗ — доставка куриц под контролем</title>
<meta name="description" content="КУРОВОЗ — сервис заказа, перевозки и приёмки куриц: клиент, перевозчик и чистка.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230B0D0E'/%3E%3Cpath d='M6 22h20M8 22V12l8-6 8 6v10' stroke='%23FFB000' stroke-width='2.4' fill='none'/%3E%3Ccircle cx='16' cy='15' r='2.4' fill='%23FFB000'/%3E%3C/svg%3E">
<style>
:root{
  --canvas:#0B0D0E; --surface-1:#111516; --surface-2:#171D1E; --surface-3:#20292A;
  --ink:#F2EDE3; --ink-muted:#9AA5A1; --ink-faint:#66726F;
  --border:#2C3737; --border-active:#697873;
  --voltage:#FFB000; --voltage-soft:#3A2A08; --voltage-hover:#FFC23D;
  --success:#59C98A; --success-soft:#173226; --danger:#FF6B5F; --danger-soft:#42211F;
  --on-voltage:#0B0D0E;
  --font-display:"Barlow Condensed","Inter",system-ui,sans-serif;
  --font-body:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;
  --font-data:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  --rail-w:240px; --util-h:72px; --gutter:32px;
  --ease-out:cubic-bezier(0.22,1,0.36,1);
  --ease-stamp:cubic-bezier(0.34,1.56,0.64,1);
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{background:var(--canvas);color:var(--ink);font-family:var(--font-body);font-size:15px;line-height:1.45;min-height:100vh;-webkit-font-smoothing:antialiased;}
::selection{background:var(--voltage);color:var(--on-voltage);}
a{color:inherit;text-decoration:none;}
button{font-family:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0;}
input,select,textarea{font-family:inherit;color:inherit;}
svg{display:block;}
ul{margin:0;padding:0;list-style:none;}
h1,h2,h3,h4,p{margin:0;}
:focus-visible{outline:2px solid var(--voltage);outline-offset:2px;}

.t-display{font-family:var(--font-display);font-weight:700;font-size:clamp(42px,5.2vw,72px);line-height:.93;letter-spacing:.01em;text-transform:uppercase;}
.t-display-sm{font-family:var(--font-display);font-weight:700;font-size:clamp(34px,3.4vw,48px);line-height:.95;letter-spacing:.01em;text-transform:uppercase;}
.t-heading{font-weight:700;font-size:22px;line-height:1.1;}
.t-heading-sm{font-weight:700;font-size:17px;line-height:1.2;}
.t-label{font-size:11px;font-weight:700;line-height:1.2;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-muted);}
.t-label-amber{color:var(--voltage);}
.t-body{font-size:15px;line-height:1.45;color:var(--ink-muted);}
.t-strong{font-size:15px;font-weight:600;line-height:1.35;}
.t-data{font-family:var(--font-data);font-weight:500;font-variant-numeric:tabular-nums;}
.t-metric{font-family:var(--font-data);font-weight:600;font-variant-numeric:tabular-nums;font-size:clamp(44px,5vw,68px);line-height:.95;letter-spacing:-.02em;}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:52px;padding:0 24px;border-radius:8px;font-size:15px;font-weight:600;line-height:1;transition:background 150ms ease,border-color 150ms ease,transform 120ms ease,color 150ms ease;min-width:44px;}
.btn:active{transform:translateY(1px);transition-duration:80ms;}
.btn-primary{background:var(--voltage);color:var(--on-voltage);}
.btn-primary:hover{background:var(--voltage-hover);}
.btn-secondary{height:48px;border:1px solid var(--border-active);color:var(--ink);background:transparent;}
.btn-secondary:hover{background:var(--surface-2);}
.btn-danger{height:48px;border:1px solid var(--danger);color:var(--danger);background:transparent;}
.btn-danger:hover{background:var(--danger-soft);}
.btn-ghost{height:44px;padding:0 12px;color:var(--ink-muted);border-radius:8px;}
.btn-ghost:hover{color:var(--ink);background:var(--surface-2);}
.btn-block{width:100%;}
.btn svg{flex:none;}
.btn:disabled,.btn-accept-zone:disabled{opacity:.45;cursor:not-allowed;}
.btn-link{color:var(--voltage);font-size:13px;font-weight:600;border-bottom:1px solid transparent;padding-bottom:1px;}
.btn-link:hover{border-bottom-color:var(--voltage);}
.btn-accept-zone{width:100%;min-height:56px;background:var(--voltage);color:var(--on-voltage);border-radius:8px;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:10px;transition:background 150ms ease,transform 120ms ease;}
.btn-accept-zone:hover{background:var(--voltage-hover);}
.btn-accept-zone:active{transform:translateY(1px);}

.badge{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;}
.badge-new{background:var(--voltage-soft);color:var(--voltage);}
.badge-ok{background:var(--success-soft);color:var(--success);}
.badge-alert{background:var(--danger-soft);color:var(--danger);}
.badge-muted{background:var(--surface-3);color:var(--ink-muted);}
.badge .dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none;}

.field{display:flex;flex-direction:column;gap:8px;}
.field .hint{font-size:12px;color:var(--ink-faint);line-height:1.35;}
.field .err{font-size:12px;color:var(--danger);line-height:1.35;}
.input,.select,.textarea{height:48px;background:var(--surface-1);border:1px solid var(--border);border-radius:8px;padding:0 14px;font-size:15px;color:var(--ink);width:100%;transition:border-color 150ms ease,box-shadow 150ms ease;}
.select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,#9AA5A1 50%),linear-gradient(135deg,#9AA5A1 50%,transparent 50%);background-position:calc(100% - 20px) 21px,calc(100% - 14px) 21px;background-size:6px 6px;background-repeat:no-repeat;padding-right:38px;}
.textarea{height:auto;min-height:88px;padding:12px 14px;resize:vertical;line-height:1.45;}
.input::placeholder,.textarea::placeholder{color:var(--ink-faint);}
.input:focus,.select:focus,.textarea:focus{outline:none;border-color:var(--voltage);box-shadow:0 0 0 2px rgba(255,176,0,.35);}
.input-num{font-family:var(--font-data);font-variant-numeric:tabular-nums;}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.field-group{display:flex;flex-direction:column;gap:20px;}
.suffix-wrap{position:relative;}
.suffix-wrap .suffix{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-family:var(--font-data);font-size:14px;color:var(--ink-muted);pointer-events:none;}
.suffix-wrap .input{padding-right:38px;}

.panel{background:var(--surface-1);border:1px solid var(--border);padding:24px;}
.card{background:var(--surface-1);border:1px solid var(--border);padding:20px;transition:border-color 150ms ease;}
.card:hover{border-color:var(--border-active);}

/* entry */
.entry{min-height:100vh;display:flex;flex-direction:column;}
.entry-bar{height:var(--util-h);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 var(--gutter);flex:none;gap:16px;flex-wrap:wrap;}
.brand{display:flex;align-items:center;gap:10px;}
.brand-mark{width:34px;height:34px;border:1px solid var(--voltage);display:flex;align-items:center;justify-content:center;flex:none;}
.brand-name{font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:.04em;line-height:1;text-transform:uppercase;}
.brand-name em{font-style:normal;color:var(--voltage);}
.entry-main{flex:1;display:grid;grid-template-columns:5fr 7fr;max-width:1440px;width:100%;margin:0 auto;}
.entry-copy{padding:48px var(--gutter);border-right:1px solid var(--border);display:flex;flex-direction:column;gap:32px;}
.entry-side{padding:24px var(--gutter) 48px;display:flex;flex-direction:column;gap:16px;min-width:0;}
.entry-role-marks{display:flex;flex-direction:column;border-top:1px solid var(--border);}
.role-mark{display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-bottom:1px solid var(--border);}
.role-mark .rm-icon{width:40px;height:40px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--voltage);flex:none;}
.role-mark h3{font-size:15px;font-weight:700;margin-bottom:2px;}
.entry-actions{display:flex;flex-direction:column;gap:16px;align-items:flex-start;}

.stepper{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.step{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint);}
.step .sn{width:22px;height:22px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--font-data);font-size:11px;}
.step.is-active{color:var(--voltage);}
.step.is-active .sn{border-color:var(--voltage);background:var(--voltage-soft);}
.step.is-done{color:var(--success);}
.step.is-done .sn{border-color:var(--success);background:var(--success-soft);}
.step-sep{width:18px;height:1px;background:var(--border);flex:none;}

.reg-card{background:var(--surface-1);border:1px solid var(--border);padding:24px;display:flex;flex-direction:column;gap:20px;}
.auth-alert{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border:1px solid var(--danger);background:var(--danger-soft);color:var(--danger);font-size:13px;line-height:1.4;}
.auth-alert svg{flex:none;margin-top:1px;}
.tabs{display:flex;gap:8px;}
.tab{flex:1;height:48px;border:1px solid var(--border);color:var(--ink-muted);font-size:14px;font-weight:600;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:8px;}
.tab.is-on{border-color:var(--voltage);background:var(--voltage-soft);color:var(--voltage);}
.tab:disabled{opacity:.4;cursor:not-allowed;}
.code-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.mock-code{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:var(--voltage-soft);color:var(--voltage);border:1px solid rgba(255,176,0,.35);font-family:var(--font-data);font-size:14px;font-weight:600;}
.role-select-list{display:flex;flex-direction:column;gap:12px;}
.role-option{display:flex;gap:16px;align-items:flex-start;text-align:left;width:100%;padding:16px;border:1px solid var(--border);background:var(--surface-1);transition:border-color 150ms ease,background 150ms ease;}
.role-option:hover{border-color:var(--border-active);background:var(--surface-2);}
.role-option.is-on{border-color:var(--voltage);background:var(--voltage-soft);}
.role-option .ro-icon{width:44px;height:44px;border:1px solid var(--border);color:var(--voltage);display:flex;align-items:center;justify-content:center;flex:none;}
.role-option .ro-title{font-weight:700;font-size:15px;}
.role-option .ro-desc{font-size:13px;color:var(--ink-muted);margin-top:2px;}

/* shell */
.shell{min-height:100vh;}
.rail{position:fixed;left:0;top:0;bottom:0;width:var(--rail-w);background:var(--surface-1);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:24px;z-index:40;}
.rail-role{margin-top:24px;padding:12px;border:1px solid var(--border);background:var(--canvas);display:flex;flex-direction:column;gap:6px;}
.rail-nav{margin-top:32px;display:flex;flex-direction:column;gap:4px;flex:1;}
.nav-item{display:flex;align-items:center;gap:12px;height:48px;padding:0 12px;font-size:13px;font-weight:600;color:var(--ink-muted);border-left:3px solid transparent;transition:color 150ms ease,background 150ms ease,border-color 150ms ease;width:100%;text-align:left;}
.nav-item:hover{color:var(--ink);background:var(--surface-2);}
.nav-item.is-active{color:var(--ink);border-left-color:var(--voltage);background:var(--surface-2);}
.nav-item.is-active svg{color:var(--voltage);}
.rail-foot{display:flex;flex-direction:column;gap:8px;}
.utilbar{position:fixed;top:0;left:var(--rail-w);right:0;height:var(--util-h);background:var(--canvas);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 var(--gutter);z-index:35;}
.util-left{display:flex;align-items:center;gap:16px;min-width:0;}
.util-right{display:flex;align-items:center;gap:12px;}
.util-role{display:flex;align-items:center;gap:8px;padding:6px 12px;border:1px solid var(--border);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--voltage);}
.icon-btn{width:44px;height:44px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--ink-muted);position:relative;transition:color 150ms ease,border-color 150ms ease,background 150ms ease;}
.icon-btn:hover{color:var(--ink);border-color:var(--border-active);background:var(--surface-2);}
.icon-btn .unread{position:absolute;top:7px;right:7px;width:6px;height:6px;border-radius:50%;background:var(--voltage);}
.avatar{width:32px;height:32px;border-radius:50%;background:var(--surface-3);border:1px solid var(--border-active);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--ink);flex:none;}
.util-user{display:flex;align-items:center;gap:10px;min-width:0;}
.util-user .uu-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.util-user .uu-phone{font-family:var(--font-data);font-size:12px;color:var(--ink-muted);}

.main{margin-left:var(--rail-w);padding:calc(var(--util-h) + 48px) var(--gutter) 64px;max-width:1440px;}
.work-grid{display:grid;grid-template-columns:5fr 7fr;gap:var(--gutter);align-items:start;}
.work-grid > .col{min-width:0;}
.page-head{display:flex;flex-direction:column;gap:12px;margin-bottom:32px;}
.page-head .ph-row{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;}
.section{margin-top:48px;}
.section-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);}

.order-list{display:flex;flex-direction:column;gap:16px;}
.order-card{display:flex;flex-direction:column;gap:16px;}
.order-card .oc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;}
.order-card .oc-id{font-family:var(--font-data);font-size:14px;color:var(--ink-muted);}
.order-card .oc-title{font-family:var(--font-display);font-size:32px;font-weight:700;line-height:1;text-transform:uppercase;}
.order-card .oc-sub{font-family:var(--font-data);font-size:14px;color:var(--ink-muted);}
.route-row{display:flex;align-items:stretch;gap:12px;}
.route-line{width:2px;background:var(--border);position:relative;flex:none;margin:6px 0;}
.route-line::before,.route-line::after{content:"";position:absolute;left:50%;transform:translateX(-50%);width:8px;height:8px;}
.route-line::before{top:0;background:var(--voltage);}
.route-line::after{bottom:0;border:1.5px solid var(--ink-muted);}
.route-points{display:flex;flex-direction:column;justify-content:space-between;gap:14px;min-width:0;flex:1;}
.route-points .rp-val{font-size:14px;line-height:1.3;}
.meta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:12px 0;}
.meta-grid .mg-item{display:flex;flex-direction:column;gap:4px;min-width:0;}
.meta-grid .mg-val{font-family:var(--font-data);font-size:15px;font-weight:600;font-variant-numeric:tabular-nums;}
.meta-grid .mg-val.accent{color:var(--voltage);}
.oc-actions{display:flex;gap:12px;flex-wrap:wrap;}
.oc-actions .btn{flex:1;min-width:160px;}

.person-row{display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface-2);border:1px solid var(--border);flex-wrap:wrap;}
.person-row .pr-main{display:flex;flex-direction:column;gap:2px;min-width:140px;flex:1;}
.person-row .pr-name{font-size:14px;font-weight:600;}
.person-row .pr-phone{font-family:var(--font-data);font-size:13px;color:var(--ink-muted);}
.reqs{width:100%;margin-top:4px;padding-top:10px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:6px;}
.reqs .rq-row{display:flex;gap:12px;font-size:13px;flex-wrap:wrap;}
.reqs .rq-k{color:var(--ink-faint);min-width:96px;}
.reqs .rq-v{font-family:var(--font-data);color:var(--ink);}

.metric-band{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);margin-bottom:32px;}
.metric-cell{background:var(--surface-1);padding:24px;display:flex;flex-direction:column;gap:8px;min-width:0;}
.metric-cell .mc-num.accent{color:var(--voltage);}
.metric-cell .mc-num small{font-size:.42em;color:var(--ink-muted);margin-left:6px;font-weight:500;}

.map-frame{border:1px solid var(--border);background:var(--surface-1);padding:16px;display:flex;flex-direction:column;gap:12px;}
.map-frame .map-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.leaflet-wrap{width:100%;height:380px;border:1px solid var(--border);background:var(--surface-1);}
.leaflet-wrap.leaflet-big{height:480px;}
.map-fallback{width:100%;height:220px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--ink-muted);background:var(--surface-2);flex-direction:column;gap:8px;}
.status-strip{display:flex;align-items:center;gap:12px;flex-wrap:wrap;border:1px solid var(--border);background:var(--surface-2);padding:12px 14px;}
.status-strip .ss-live{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--voltage);}
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--voltage);position:relative;flex:none;}
.pulse-dot::after{content:"";position:absolute;inset:-4px;border:1px solid var(--voltage);border-radius:50%;animation:pulseRing 2200ms ease-out infinite;}
@keyframes pulseRing{0%{transform:scale(.5);opacity:.9;}70%{transform:scale(1.8);opacity:0;}100%{opacity:0;}}
.eta-module{border-top:1px solid var(--border);padding-top:16px;display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;}
.eta-num{font-family:var(--font-data);font-weight:600;font-variant-numeric:tabular-nums;font-size:clamp(40px,4vw,56px);line-height:.95;color:var(--voltage);}
.eta-module .eta-side{display:flex;flex-direction:column;gap:4px;text-align:right;}
.eta-module .eta-side .es-val{font-family:var(--font-data);font-size:15px;font-weight:600;}
.map-legend{display:flex;gap:16px;flex-wrap:wrap;}
.legend-item{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-muted);}
.legend-swatch{width:12px;height:12px;flex:none;}
.legend-swatch.route{height:3px;background:var(--voltage);}
.legend-swatch.client{background:var(--ink);}
.legend-swatch.workshop{border:1.5px solid var(--ink);}
.legend-swatch.carrier{border-radius:50%;background:var(--voltage);}

.drawer-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:60;animation:fadeIn 180ms ease;}
.drawer{position:fixed;top:0;right:0;bottom:0;width:360px;max-width:100vw;background:var(--surface-1);border-left:1px solid var(--border);z-index:61;display:flex;flex-direction:column;animation:slideIn 240ms var(--ease-out);}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideIn{from{transform:translateX(16px);opacity:0;}to{transform:none;opacity:1;}}
.drawer-head{height:var(--util-h);border-bottom:1px solid var(--border);padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;}
.drawer-body{flex:1;overflow:auto;}
.notif-row{display:flex;flex-direction:column;gap:8px;padding:16px 20px;border-bottom:1px solid var(--border);border-left:3px solid transparent;}
.notif-row.is-unread{border-left-color:var(--voltage);background:var(--surface-2);}
.notif-row .nr-text{font-size:14px;line-height:1.4;}
.notif-row .nr-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.notif-row .nr-time{font-family:var(--font-data);font-size:12px;color:var(--ink-faint);}
.drawer-foot{border-top:1px solid var(--border);padding:16px 20px;display:flex;gap:12px;}
.empty{border:1px dashed var(--border);padding:32px 24px;text-align:center;color:var(--ink-muted);display:flex;flex-direction:column;gap:8px;align-items:center;}

.chat-layout{display:grid;grid-template-columns:280px 1fr;gap:1px;background:var(--border);border:1px solid var(--border);min-height:560px;}
.chat-list{background:var(--surface-1);display:flex;flex-direction:column;}
.chat-list-head{padding:16px;border-bottom:1px solid var(--border);}
.chat-conv{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border-bottom:1px solid var(--border);text-align:left;width:100%;border-left:3px solid transparent;}
.chat-conv:hover{background:var(--surface-2);}
.chat-conv.is-on{background:var(--surface-2);border-left-color:var(--voltage);}
.chat-conv .cc-title{font-size:13px;font-weight:600;}
.chat-conv .cc-sub{font-family:var(--font-data);font-size:11px;color:var(--ink-muted);}
.chat-main{background:var(--canvas);display:flex;flex-direction:column;min-width:0;}
.chat-head{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.chat-context{padding:12px 20px;border-bottom:1px solid var(--border);background:var(--surface-1);display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.chip{display:inline-flex;align-items:center;height:22px;padding:0 8px;background:var(--voltage-soft);color:var(--voltage);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
.msgs{flex:1;overflow:auto;padding:20px;display:flex;flex-direction:column;gap:12px;max-height:520px;}
.msg{max-width:72%;padding:12px 14px;display:flex;flex-direction:column;gap:6px;}
.msg.mine{background:var(--surface-2);align-self:flex-end;}
.msg.theirs{background:transparent;border:1px solid var(--border);align-self:flex-start;}
.msg .m-text{font-size:14px;line-height:1.45;}
.msg .m-meta{display:flex;gap:10px;align-items:center;font-family:var(--font-data);font-size:11px;color:var(--ink-faint);}
.chat-compose{border-top:1px solid var(--border);padding:16px 20px;display:flex;gap:12px;align-items:flex-end;}
.chat-compose .textarea{min-height:48px;max-height:120px;}
.chat-compose .btn{height:48px;flex:none;}

.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--gutter);align-items:start;}
.kv-list{display:flex;flex-direction:column;}
.kv{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid var(--border);flex-wrap:wrap;}
.kv:last-child{border-bottom:0;}
.kv .kv-k{color:var(--ink-muted);font-size:13px;}
.kv .kv-v{font-family:var(--font-data);font-size:15px;font-weight:600;text-align:right;}
.kv .kv-v.wrap{text-align:right;}

.bottomnav{display:none;position:fixed;left:0;right:0;bottom:0;height:64px;z-index:50;background:var(--surface-1);border-top:1px solid var(--border);}
.bottomnav .bn-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:var(--ink-muted);font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;}
.bottomnav .bn-item.is-active{color:var(--voltage);}
.mobile-top{display:none;}

.toast-root{position:fixed;right:24px;bottom:24px;z-index:80;display:flex;flex-direction:column;gap:12px;max-width:360px;}
.toast{background:var(--surface-2);border:1px solid var(--border-active);padding:14px 16px;display:flex;gap:12px;align-items:flex-start;animation:toastIn 280ms var(--ease-out);}
.toast.t-ok{border-left:3px solid var(--success);}
.toast.t-alert{border-left:3px solid var(--danger);}
.toast.t-live{border-left:3px solid var(--voltage);}
.toast .ts-text{font-size:13px;line-height:1.4;}
@keyframes toastIn{from{transform:translateX(16px);opacity:0;}to{transform:none;opacity:1;}}

.stamp{animation:stampIn 240ms var(--ease-stamp);}
@keyframes stampIn{from{transform:scale(.85) rotate(-3deg);opacity:0;}to{transform:none;opacity:1;}}
.intake{animation:intake 280ms var(--ease-out) both;}
@keyframes intake{from{transform:translateX(16px);opacity:0;}to{transform:none;opacity:1;}}
.intake-1{animation-delay:0ms;}.intake-2{animation-delay:70ms;}.intake-3{animation-delay:140ms;}

.dialog-wrap{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.55);animation:fadeIn 180ms ease;}
.dialog{background:var(--surface-1);border:1px solid var(--border);padding:24px;width:100%;max-width:440px;display:flex;flex-direction:column;gap:20px;}
.dialog-actions{display:flex;gap:12px;flex-wrap:wrap;}
.dialog-actions .btn{flex:1;min-width:140px;}

.menu-sheet{position:fixed;inset:0;z-index:65;background:rgba(0,0,0,.55);}
.menu-sheet .ms-panel{position:absolute;top:0;left:0;right:0;bottom:64px;background:var(--surface-1);border-bottom:1px solid var(--border);padding:20px;display:flex;flex-direction:column;gap:16px;overflow:auto;animation:slideDown 240ms var(--ease-out);}
@keyframes slideDown{from{transform:translateY(-12px);opacity:0;}to{transform:none;opacity:1;}}

.row{display:flex;align-items:center;gap:12px;}
.row-wrap{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.col{display:flex;flex-direction:column;}
.gap-4{gap:4px;}.gap-8{gap:8px;}.gap-12{gap:12px;}.gap-16{gap:16px;}.gap-24{gap:24px;}
.mt-8{margin-top:8px;}.mt-12{margin-top:12px;}.mt-16{margin-top:16px;}.mt-24{margin-top:24px;}
.muted{color:var(--ink-muted);}.faint{color:var(--ink-faint);}.amber{color:var(--voltage);}.green{color:var(--success);}.red{color:var(--danger);}
.big-num-row{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;}

.km-marker{display:flex;align-items:center;justify-content:center;}
.km-marker .km-truck{width:34px;height:34px;border-radius:50%;background:var(--voltage);display:flex;align-items:center;justify-content:center;color:#0B0D0E;box-sizing:border-box;}
.km-node{width:18px;height:18px;background:#F2EDE3;}
.km-node-workshop{width:22px;height:22px;background:#0B0D0E;border:2.5px solid #F2EDE3;display:flex;align-items:center;justify-content:center;}
.km-node-workshop i{width:10px;height:10px;background:var(--voltage);display:block;}

@media (max-width:1099px){
  :root{--gutter:24px;}
  .rail,.utilbar{display:none;}
  .mobile-top{display:flex;position:fixed;top:0;left:0;right:0;height:64px;z-index:35;background:var(--canvas);border-bottom:1px solid var(--border);align-items:center;justify-content:space-between;gap:12px;padding:0 var(--gutter);}
  .main{margin-left:0;padding:calc(64px + 24px) var(--gutter) 96px;}
  .entry-main{grid-template-columns:1fr;}
  .entry-copy{border-right:0;border-bottom:1px solid var(--border);}
  .work-grid{grid-template-columns:1fr;}
  .profile-grid{grid-template-columns:1fr;}
  .chat-layout{grid-template-columns:1fr;}
  .chat-list{max-height:220px;overflow:auto;}
  .bottomnav{display:flex;}
  .metric-band{grid-template-columns:1fr;}
}
@media (max-width:767px){
  :root{--gutter:16px;}
  .main{padding:calc(64px + 16px) var(--gutter) 96px;}
  .field-row{grid-template-columns:1fr;}
  .meta-grid{grid-template-columns:1fr;}
  .meta-grid .mg-item{flex-direction:row;justify-content:space-between;align-items:baseline;gap:12px;}
  .oc-actions .btn{min-width:120px;}
  .drawer{width:100vw;}
  .toast-root{right:12px;left:12px;bottom:76px;max-width:none;}
  .chat-compose{flex-direction:column;align-items:stretch;}
  .chat-compose .btn{width:100%;}
  .msg{max-width:88%;}
  .entry-copy{padding:32px var(--gutter);}
  .reg-card,.panel{padding:16px;}
  .eta-module .eta-side{text-align:left;}
  .leaflet-wrap{height:280px;}
  .leaflet-wrap.leaflet-big{height:320px;}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:100ms !important;}
}
</style>
</head>
<body>
<div id="app"></div>
<div id="overlay-root"></div>
<div class="toast-root" id="toast-root"></div>
<div id="live-region" class="sr-only" aria-live="polite" aria-atomic="true"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
'use strict';

/* ============================================================
   0. УТИЛИТЫ
   ============================================================ */
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
var fmtMoney = new Intl.NumberFormat('ru-RU');
function money(n){ return fmtMoney.format(Math.round(n || 0)) + ' ₽'; }
function plural(n, forms){
  var n10 = Math.abs(n) % 10, n100 = Math.abs(n) % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
  return forms[2];
}
function chickenWord(n){ return plural(n, ['курица','курицы','куриц']); }
function formatPhoneInput(d){
  d = String(d || '').replace(/\D/g, '');
  if (d.charAt(0) === '8') d = '7' + d.slice(1);
  if (d.length && d.charAt(0) !== '7') d = '7' + d;
  d = d.slice(0, 11);
  return d;
}
function prettyPhone(d){
  d = formatPhoneInput(d);
  if (d.length < 11) return '+' + d;
  return '+7 (' + d.slice(1, 4) + ') ' + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9, 11);
}
function fmtCardFull(card){
  var clean = String(card || '').replace(/\D/g, '');
  var out = [];
  for (var i = 0; i < clean.length; i += 4) out.push(clean.slice(i, i + 4));
  return out.join(' ');
}
function maskCard(card){
  var c = String(card || '');
  if (c.length < 8) return c;
  return c.slice(0, 4) + ' •••• •••• ' + c.slice(-4);
}
function fmtTime(ts){
  var d = new Date(ts);
  return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
}
function timeAgo(ts){
  var min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return min + ' ' + plural(min, ['минуту','минуты','минут']) + ' назад';
  var h = Math.floor(min / 60);
  if (h < 24) return h + ' ' + plural(h, ['час','часа','часов']) + ' назад';
  return fmtTime(ts);
}

/* ============================================================
   1. ИКОНКИ
   ============================================================ */
function icon(name, size){
  var s = size || 20;
  var open = '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var p = {
    chicken: '<path d="M8 13c-2 0-4 1.6-4 4 0 2.2 2 4 5 4h7c3.2 0 5-1.8 5-4 0-2.6-2-4.2-4.2-4.2"/><circle cx="14.5" cy="6.5" r="2.5"/><path d="M12.4 8.3C10.6 9.7 8 10.4 5 10l1.4 2.2"/><path d="M16.8 9v3.4"/><path d="M9 21v-2M15 21v-2"/>',
    truck: '<path d="M2 7h11v9H2z"/><path d="M13 10h4.5L21 13v3h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/><path d="M8.3 17.5h6.9"/>',
    workshop: '<path d="M3 20V9l5-4 5 4v11"/><path d="M13 20V13h8v7"/><path d="M6 20v-5h4v5"/><path d="M16 16h2"/><path d="M8 3v3"/>',
    phone: '<path d="M6 3h3l2 5-2.2 1.6a12 12 0 0 0 5.6 5.6L16 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 4 5a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="2.5" y="5.5" width="19" height="13" rx="1.5"/><path d="M3 7l9 6 9-6"/>',
    card: '<rect x="2.5" y="5.5" width="19" height="13" rx="1.5"/><path d="M2.5 10h19"/><path d="M6 14.5h4"/>',
    bell: '<path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9z"/><path d="M10 18a2 2 0 0 0 4 0"/>',
    chat: '<path d="M4 5h16v10H9l-5 4V5z"/><path d="M8 9h8M8 12h5"/>',
    pin: '<path d="M12 21s-6.5-6.1-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.9-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.5 2.2"/>',
    check: '<path d="M4.5 12.5l5 5 10-11"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    route: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H14a3.5 3.5 0 0 1 0 7H10a3.5 3.5 0 0 0 0 7h5.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/>',
    logout: '<path d="M10 5H5v14h5"/><path d="M15 8l4 4-4 4"/><path d="M19 12H9"/>',
    edit: '<path d="M4 20h4L20 8l-4-4L4 16v4z"/><path d="M14.5 5.5l4 4"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    eyeOff: '<path d="M4 4l16 16"/><path d="M9.5 9.6A2.8 2.8 0 0 0 12 14.8"/><path d="M6.2 6.9C4 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1"/><path d="M18.4 15.4C20.4 13.9 21.5 12 21.5 12S18 5.5 12 5.5c-.7 0-1.4.1-2 .2"/>',
    box: '<path d="M3 8l9-4 9 4v8l-9 4-9-4V8z"/><path d="M3 8l9 4 9-4M12 12v8"/>',
    send: '<path d="M4 12l16-7-6 16-2.5-6.5L4 12z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8.2v.1"/>',
    locate: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>'
  };
  return open + (p[name] || p.info) + '</svg>';
}

/* ============================================================
   2. СОСТОЯНИЕ
   ============================================================ */
var S = {
  meta: null,
  me: null,
  token: '',
  orders: [],
  notifications: [],
  workshops: [],
  messages: [],
  view: 'orders',
  chatOrderId: null,
  newOrderOpen: false,
  editProfile: false,
  showReq: {},
  drawerOpen: false,
  menuOpen: false,
  dialog: null,
  map: null,
  mapLayers: [],
  offline: false
};
var wiz = {
  step: 'contact',
  channel: 'sms',
  phone: '',
  email: '',
  code: '',
  devCode: '',
  errors: {},
  busy: false,
  profile: { name: '', bank: '', card: '', recipient: '', address: '' }
};
function captureWizInputs(){
  var p = wiz.profile;
  var n;
  n = $('[name="phone"]'); if (n && wiz.step === 'contact') wiz.phone = formatPhoneInput(n.value);
  n = $('[name="email"]'); if (n && (wiz.step === 'contact' || wiz.step === 'profile')) {
    if (wiz.step === 'contact') wiz.email = n.value.trim();
  }
  if (wiz.step === 'profile') {
    ['name', 'bank', 'card', 'recipient', 'address'].forEach(function(k){
      var el = $('[name="' + k + '"]');
      if (el) p[k] = el.value;
    });
  }
}
var ROLE_LABEL = { client: 'Клиент', carrier: 'Перевозчик', workshop: 'Чистка' };
var ROLE_DESC = {
  client: 'Заказывайте куриц, назначайте цену перевозчику и отправляйте партию в цех.',
  carrier: 'Принимайте заказы, везите куриц в цех и получайте деньги за перевозку.',
  workshop: 'Видите, сколько куриц едет к вам, кто везёт и когда они прибудут.'
};
var STATE_LABEL = {
  awaiting_carrier: 'Ожидает перевозчика',
  to_pickup: 'Едет на погрузку',
  in_transit: 'В пути',
  arrived: 'Прибыл в цех',
  done: 'Завершён',
  cancelled: 'Отменён'
};

/* ============================================================
   3. API
   ============================================================ */
function loadToken(){
  try { return localStorage.getItem('kurovoz_token') || ''; } catch (e) { return ''; }
}
function saveToken(token){
  S.token = token || '';
  try {
    if (token) localStorage.setItem('kurovoz_token', token);
    else localStorage.removeItem('kurovoz_token');
  } catch (e) {}
}
function api(path, opts){
  opts = opts || {};
  var headers = { 'Content-Type': 'application/json' };
  if (S.token) headers.Authorization = 'Bearer ' + S.token;
  var init = {
    method: opts.method || 'GET',
    headers: headers,
    credentials: 'same-origin'
  };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  return fetch(path, init).then(function(res){
    return res.json().catch(function(){ return {}; }).then(function(data){
      if (res.status === 401) {
        if (S.me) {
          S.me = null;
          saveToken('');
          renderAuth();
          toast('Сессия не найдена — войдите заново', 'alert');
        }
        var e1 = new Error(data.error || 'Сессия истекла');
        throw e1;
      }
      if (!res.ok) {
        var e = new Error(data.error || ('Ошибка сервера ' + res.status));
        e.data = data;
        e.status = res.status;
        throw e;
      }
      return data;
    });
  }).catch(function(err){
    if (err && err.message === 'Failed to fetch') {
      S.offline = true;
      throw new Error('Нет связи с сервером');
    }
    throw err;
  });
}

function announce(text){
  var el = $('#live-region');
  if (el) el.textContent = text;
}
function toast(text, kind){
  var root = $('#toast-root');
  if (!root) return;
  var el = document.createElement('div');
  el.className = 'toast ' + (kind === 'ok' ? 't-ok' : kind === 'alert' ? 't-alert' : 't-live');
  el.innerHTML = '<div class="ts-text">' + esc(text) + '</div>';
  root.appendChild(el);
  setTimeout(function(){
    el.style.opacity = '0';
    el.style.transition = 'opacity 200ms ease';
    setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 220);
  }, 4500);
}
function unreadCount(){
  return S.notifications.filter(function(n){ return !n.read; }).length;
}

/* ============================================================
   4. КАРТА (Leaflet)
   ============================================================ */
function leafletAvailable(){ return typeof window.L !== 'undefined' && window.L.map; }

function destroyMap(){
  if (S.map) {
    try { S.map.remove(); } catch (e) {}
    S.map = null;
    S.mapLayers = [];
  }
}
function markerIcon(kind){
  if (!leafletAvailable()) return null;
  if (kind === 'carrier') {
    return L.divIcon({
      className: 'km-marker',
      html: '<div class="km-truck"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B0D0E" stroke-width="2"><path d="M2 7h11v9H2z"/><path d="M13 10h4.5L21 13v3h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg></div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
  }
  if (kind === 'workshop') {
    return L.divIcon({ className: 'km-marker', html: '<div class="km-node-workshop"><i></i></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
  }
  return L.divIcon({ className: 'km-marker', html: '<div class="km-node"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
}

/* строит карту для одного заказа */
function mountOrderMap(host, order, big){
  if (!host) return;
  if (!leafletAvailable()) {
    host.outerHTML = '<div class="map-fallback">' + icon('pin', 24) +
      '<div class="t-body">Карта недоступна (нет библиотеки Leaflet)</div>' +
      '<div class="t-data">' + esc(order.pickup) + ' → ' + esc(order.workshopAddress) + '</div></div>';
    return;
  }
  destroyMap();
  var map = L.map(host, { zoomControl: true, attributionControl: true, scrollWheelZoom: false });
  S.map = map;
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  var pts = [];
  var pickup = (order.pickupLat && order.pickupLng) ? [order.pickupLat, order.pickupLng] : null;
  var dest = (order.workshopLat && order.workshopLng) ? [order.workshopLat, order.workshopLng] : null;

  if (pickup) {
    pts.push(pickup);
    L.marker(pickup, { icon: markerIcon('pickup') }).addTo(map).bindPopup('Погрузка: ' + esc(order.pickup));
  }
  if (dest) {
    pts.push(dest);
    L.marker(dest, { icon: markerIcon('workshop') }).addTo(map).bindPopup('Чистка: ' + esc(order.workshopAddress));
  }
  if (pickup && dest) {
    L.polyline([pickup, dest], { color: '#FFB000', weight: 3, opacity: 0.95 }).addTo(map);
  }
  if (order.position) {
    var c = [order.position.lat, order.position.lng];
    pts.push(c);
    L.marker(c, { icon: markerIcon('carrier'), zIndexOffset: 500 }).addTo(map)
      .bindPopup('Перевозчик' + (order.carrier ? ': ' + esc(order.carrier.name) : '') +
        (order.etaMin != null ? '<br>Прибытие через ' + order.etaMin + ' мин' : ''));
    if (order.position.ts) {
      L.circle(c, {
        radius: 220, color: '#FFB000', weight: 1, opacity: 0.5, fillOpacity: 0.08, fillColor: '#FFB000'
      }).addTo(map);
    }
  }

  if (pts.length >= 2) {
    map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
  } else if (pts.length === 1) {
    map.setView(pts[0], 13);
  } else {
    map.setView([55.751244, 37.618423], 11); // Москва по умолчанию
    host.insertAdjacentHTML('afterend',
      '<div class="t-body" style="margin-top:8px;">Координаты ещё определятся — карта появится, как только станут известны адреса.</div>');
  }
  setTimeout(function(){ map.invalidateSize(); }, 60);
}

function statusStripHtml(order){
  var text;
  if (order.state === 'awaiting_carrier') text = 'Маршрут построен, перевозчик ещё не назначен';
  else if (order.state === 'to_pickup') text = 'Перевозчик едет на погрузку';
  else if (order.state === 'in_transit') text = 'В пути';
  else if (order.state === 'arrived') text = 'Прибыл в цех';
  else if (order.state === 'done') text = 'Доставка завершена';
  else text = 'Заказ отменён';
  return '<div class="status-strip">' +
    '<span class="ss-live"><span class="pulse-dot"></span>' + esc(text) + '</span>' +
    '<span class="muted">·</span><span class="t-data">' + order.qty + ' ' + chickenWord(order.qty) + '</span>' +
    '<span class="muted">·</span><span class="t-data">' + money(order.pricePer) + ' / шт</span>' +
    '<span class="muted">·</span><span class="t-strong">' + esc((order.carrier && order.carrier.name) || 'Перевозчик не назначен') + '</span>' +
  '</div>';
}

function etaHtml(order){
  if (order.state === 'done') {
    return '<div class="eta-module"><div><div class="t-label">Доставлено</div>' +
      '<div class="eta-num green">' + fmtTime(order.deliveredAt || order.createdAt) + '</div></div>' +
      '<div class="eta-side"><div class="t-label">Статус</div><div class="es-val green">В цеху</div>' +
      '<div class="t-data muted">' + order.qty + ' ' + chickenWord(order.qty) + '</div></div></div>';
  }
  if (order.state === 'cancelled') return '';
  var live = order.state === 'to_pickup' || order.state === 'in_transit' || order.state === 'arrived';
  if (!live) return '';
  var eta = order.etaMin;
  return '<div class="eta-module">' +
    '<div><div class="t-label">' + (order.state === 'to_pickup' ? 'На погрузку через' : 'Прибытие через') + '</div>' +
      '<div class="eta-num">' + (eta == null ? '—' : eta + ' мин') + '</div></div>' +
    '<div class="eta-side"><div class="t-label">Ожидаемое прибытие</div>' +
      '<div class="es-val">' + (eta == null ? 'уточняется' : fmtTime(Date.now() + eta * 60000)) + '</div>' +
      '<div class="t-data muted">' + esc(order.position ? 'по геопозиции перевозчика' : 'ожидаем координаты') + '</div></div>' +
  '</div>';
}

function mapFrameHtml(order, big){
  return '<div class="map-frame">' +
    '<div class="map-head">' +
      '<div class="t-label t-label-amber">Маршрут ' + esc(order.id) + '</div>' +
      '<div class="map-legend">' +
        '<div class="legend-item"><span class="legend-swatch route"></span>Маршрут</div>' +
        '<div class="legend-item"><span class="legend-swatch client"></span>Погрузка</div>' +
        '<div class="legend-item"><span class="legend-swatch workshop"></span>Чистка</div>' +
        '<div class="legend-item"><span class="legend-swatch carrier"></span>Перевозчик</div>' +
      '</div>' +
    '</div>' +
    '<div class="leaflet-wrap' + (big ? ' leaflet-big' : '') + ' js-leaflet" data-order="' + esc(order.id) + '"></div>' +
    statusStripHtml(order) +
    etaHtml(order) +
  '</div>';
}

/* ============================================================
   5. АВТОРИЗАЦИЯ
   ============================================================ */
function cityDecorSvg(){
  var g = '';
  var i;
  for (i = 0; i <= 10; i++) g += '<line x1="' + (i * 100) + '" y1="0" x2="' + (i * 100) + '" y2="640" stroke="#20292A" stroke-width="' + (i % 5 === 0 ? 3 : 1) + '"/>';
  for (i = 0; i <= 7; i++) g += '<line x1="0" y1="' + (i * 80) + '" x2="1000" y2="' + (i * 80) + '" stroke="#20292A" stroke-width="' + (i % 4 === 0 ? 3 : 1) + '"/>';
  var blocks = [[60,40,180,120],[300,60,140,90],[520,30,200,110],[800,60,140,100],[80,240,160,100],[320,220,180,120],[560,200,120,140],[720,240,180,90],[40,440,200,120],[300,420,150,100],[520,440,170,110],[780,380,140,120]];
  blocks.forEach(function(b){ g += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" fill="#111516"/>'; });
  g += '<path d="M 0 600 L 380 380 L 720 300 L 1000 120" stroke="#20292A" stroke-width="6" fill="none"/>';
  g += '<path d="M 220 200 C 340 300, 520 420, 760 420" stroke="#FFB000" stroke-width="3" fill="none"/>';
  g += '<rect x="211" y="191" width="18" height="18" fill="#F2EDE3"/>';
  g += '<rect x="749" y="409" width="22" height="22" fill="#0B0D0E" stroke="#F2EDE3" stroke-width="2.5"/>';
  g += '<circle cx="430" cy="330" r="17" fill="#FFB000"/>';
  return '<svg viewBox="0 0 1000 640" role="img" aria-label="Схема города с маршрутом доставки" style="width:100%;height:auto;">' +
    '<rect width="1000" height="640" fill="#0F1414"/>' + g + '</svg>';
}

function authStepperHtml(){
  var labels = [['contact','Контакт'], ['code','Код'], ['profile','Профиль и роль']];
  var order = ['contact', 'code', 'profile'];
  var idx = order.indexOf(wiz.step);
  var html = '<div class="stepper">';
  labels.forEach(function(l, i){
    if (i > 0) html += '<div class="step-sep"></div>';
    var cls = i === idx ? 'is-active' : (i < idx ? 'is-done' : '');
    html += '<div class="step ' + cls + '"><span class="sn">' + (i < idx ? '✓' : (i + 1)) + '</span>' + esc(l[1]) + '</div>';
  });
  return html + '</div>';
}

function authAlertHtml(){
  var e = wiz.errors || {};
  var msg = e.general || e.contact || e.code || e.name || '';
  return msg ? '<div class="auth-alert">' + icon('info', 18) + '<span>' + esc(msg) + '</span></div>' : '';
}

function authPanelHtml(){
  var e = wiz.errors || {};
  var meta = S.meta || {};
  var smsOn = meta.smsEnabled !== false;
  var mailOn = !!meta.emailEnabled;

  if (wiz.step === 'contact') {
    return '<div class="reg-card">' +
      authAlertHtml() +
      '<div class="col gap-8">' +
        '<div class="t-label t-label-amber">Вход и регистрация</div>' +
        '<h2 class="t-heading">Подтвердите номер или почту</h2>' +
        '<p class="t-body">Пришлём код подтверждения. Он заменяет пароль.</p>' +
      '</div>' +
      '<div class="tabs">' +
        '<button type="button" class="tab' + (wiz.channel === 'sms' ? ' is-on' : '') + '" data-action="wiz-channel" data-channel="sms"' + (smsOn ? '' : ' disabled') + '>' + icon('phone', 18) + ' SMS</button>' +
        '<button type="button" class="tab' + (wiz.channel === 'email' ? ' is-on' : '') + '" data-action="wiz-channel" data-channel="email"' + (mailOn ? '' : ' disabled') + '>' + icon('mail', 18) + ' E-mail</button>' +
      '</div>' +
      (!mailOn ? '<div class="hint t-body" style="font-size:12px;">Чтобы включить вход по почте, заполните SMTP-настройки в файле .env и перезапустите сервер.</div>' : '') +
      (wiz.channel === 'sms'
        ? '<form class="field-group" data-form="wiz-contact" novalidate>' +
            '<div class="field">' +
              '<label class="t-label" for="wiz-phone">Номер телефона</label>' +
              '<input class="input input-num" id="wiz-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="+7 (___) ___-__-__" value="' + esc(prettyPhone(wiz.phone || '7')) + '" data-phone>' +
              '<div class="err">' + esc(e.contact || '') + '</div>' +
            '</div>' +
            '<button class="btn btn-primary btn-block" type="submit"' + (wiz.busy ? ' disabled' : '') + '>' + (wiz.busy ? 'Отправка…' : 'Получить код') + icon('send', 18) + '</button>' +
          '</form>'
        : '<form class="field-group" data-form="wiz-contact" novalidate>' +
            '<div class="field">' +
              '<label class="t-label" for="wiz-email">E-mail</label>' +
              '<input class="input" id="wiz-email" name="email" type="email" autocomplete="email" placeholder="you@mail.ru" value="' + esc(wiz.email) + '">' +
              '<div class="err">' + esc(e.contact || '') + '</div>' +
            '</div>' +
            '<button class="btn btn-primary btn-block" type="submit"' + (wiz.busy ? ' disabled' : '') + '>' + (wiz.busy ? 'Отправка…' : 'Получить код') + icon('send', 18) + '</button>' +
          '</form>') +
    '</div>';
  }

  if (wiz.step === 'code') {
    return '<div class="reg-card">' +
      authAlertHtml() +
      '<div class="col gap-8">' +
        '<div class="t-label t-label-amber">Шаг 2 · Код</div>' +
        '<h2 class="t-heading">Введите код</h2>' +
        '<p class="t-body">Отправили на <span class="t-data">' + esc(wiz.channel === 'sms' ? prettyPhone(wiz.phone) : wiz.email) + '</span></p>' +
      '</div>' +
      (wiz.devCode ? '<div class="code-row"><div class="mock-code">' + icon('info', 16) + ' Код: ' + esc(wiz.devCode) + '</div></div>' : '') +
      '<form class="field-group" data-form="wiz-code" novalidate>' +
        '<div class="field">' +
          '<label class="t-label" for="wiz-code">Код подтверждения</label>' +
          '<input class="input input-num" id="wiz-code" name="code" inputmode="numeric" maxlength="4" placeholder="••••" value="' + esc(wiz.code) + '" style="letter-spacing:.4em;font-size:20px;">' +
          '<div class="err">' + esc(e.code || '') + '</div>' +
        '</div>' +
        '<button class="btn btn-primary btn-block" type="submit"' + (wiz.busy ? ' disabled' : '') + '>' + (wiz.busy ? 'Проверка…' : 'Подтвердить') + icon('check', 18) + '</button>' +
      '</form>' +
      '<div class="row-wrap">' +
        '<button class="btn-link" data-action="wiz-resend">Отправить код ещё раз</button>' +
        '<button class="btn-link" data-action="wiz-back">Изменить контакт</button>' +
      '</div>' +
    '</div>';
  }

  /* profile */
  var roles = ['client', 'carrier', 'workshop'];
  var wp = wiz.profile || {};
  return '<div class="reg-card">' +
    authAlertHtml() +
    '<div class="col gap-8">' +
      '<div class="t-label t-label-amber">Шаг 3 · Профиль</div>' +
      '<h2 class="t-heading">Имя и реквизиты</h2>' +
      '<p class="t-body">Аккаунт с таким контактом не найден — заполните профиль, чтобы зарегистрироваться. Реквизиты нужны для переводов между клиентом, перевозчиком и цехом; их видят только участники ваших заказов.</p>' +
    '</div>' +
    '<form class="field-group" data-form="wiz-profile" novalidate>' +
      '<div class="field">' +
        '<label class="t-label" for="wiz-name">Ваше имя</label>' +
        '<input class="input" id="wiz-name" name="name" placeholder="Например: Иван Соколов" value="' + esc(wp.name || '') + '">' +
        '<div class="err">' + esc(e.name || '') + '</div>' +
      '</div>' +
      '<div class="field-row">' +
        '<div class="field">' +
          '<label class="t-label" for="wiz-bank">Банк</label>' +
          '<input class="input" id="wiz-bank" name="bank" placeholder="Например: Сбербанк" value="' + esc(wp.bank || '') + '">' +
          '<div class="err">' + esc(e.bank || '') + '</div>' +
        '</div>' +
        '<div class="field">' +
          '<label class="t-label" for="wiz-card">Номер карты или счёта</label>' +
          '<input class="input input-num" id="wiz-card" name="card" inputmode="numeric" placeholder="0000 0000 0000 0000" data-card value="' + esc(wp.card ? fmtCardFull(wp.card) : '') + '">' +
          '<div class="err">' + esc(e.card || '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="field">' +
        '<label class="t-label" for="wiz-recipient">Получатель</label>' +
        '<input class="input" id="wiz-recipient" name="recipient" placeholder="ФИО или название организации" value="' + esc(wp.recipient || '') + '">' +
        '<div class="err">' + esc(e.recipient || '') + '</div>' +
      '</div>' +
      '<div class="field">' +
        '<label class="t-label">Роль</label>' +
        '<div class="role-select-list">' +
          roles.map(function(r){
            return '<button type="button" class="role-option' + (wiz.role === r ? ' is-on' : '') + '" data-action="wiz-role" data-role="' + r + '">' +
              '<div class="ro-icon">' + icon(r === 'client' ? 'user' : r === 'carrier' ? 'truck' : 'workshop', 22) + '</div>' +
              '<div><div class="ro-title">' + esc(ROLE_LABEL[r]) + '</div><div class="ro-desc">' + esc(ROLE_DESC[r]) + '</div></div>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<div class="err">' + esc(e.role || '') + '</div>' +
      '</div>' +
      '<div class="field" id="wiz-address-field" style="display:' + (wiz.role === 'workshop' ? 'flex' : 'none') + ';">' +
        '<label class="t-label" for="wiz-address">Адрес цеха (чистки)</label>' +
        '<input class="input" id="wiz-address" name="address" placeholder="Москва, ул. Братиславская, 18" value="' + esc(wp.address || '') + '">' +
        '<div class="hint">Клиенты будут выбирать ваш цех при создании заказа.</div>' +
        '<div class="err">' + esc(e.address || '') + '</div>' +
      '</div>' +
      '<button class="btn btn-primary btn-block" type="submit"' + (wiz.busy ? ' disabled' : '') + '>' + (wiz.busy ? 'Создание…' : 'Создать профиль') + icon('check', 18) + '</button>' +
    '</form>' +
  '</div>';
}

function renderAuth(){
  destroyMap();
  $('#overlay-root').innerHTML = '';
  $('#app').innerHTML =
  '<div class="entry">' +
    '<header class="entry-bar">' +
      '<div class="brand"><div class="brand-mark">' + icon('chicken', 20) + '</div><div class="brand-name">Куро<em>воз</em></div></div>' +
      '<div class="t-label">Телефон и реквизиты участников — всегда на виду</div>' +
    '</header>' +
    '<div class="entry-main">' +
      '<section class="entry-copy">' +
        '<div class="col gap-16">' +
          '<div class="t-label t-label-amber">Логистическая станция · курицы</div>' +
          '<h1 class="t-display">Курицы едут.<br>Всё под контролем.</h1>' +
          '<p class="t-body" style="max-width:44ch;">Заказы, перевозка и приёмка куриц в одном окне. Клиент назначает цену за курицу, перевозчик принимает заказ, чистка видит, сколько приедет и когда.</p>' +
        '</div>' +
        '<div class="entry-actions">' +
          '<button class="btn btn-primary" data-action="wiz-focus">' + icon('phone', 18) + ' Войти по номеру</button>' +
          '<div class="t-body" style="font-size:13px;">Регистрация и вход — по коду из SMS или письма на почту.</div>' +
        '</div>' +
        '<div class="entry-role-marks">' +
          '<div class="role-mark"><div class="rm-icon">' + icon('user', 20) + '</div><div><h3>Клиент</h3><div class="t-body" style="font-size:13px;">Заказывает N куриц и назначает цену перевозчику за 1 курицу.</div></div></div>' +
          '<div class="role-mark"><div class="rm-icon">' + icon('truck', 20) + '</div><div><h3>Перевозчик</h3><div class="t-body" style="font-size:13px;">Принимает заказ, везёт куриц в цех и получает деньги по реквизитам.</div></div></div>' +
          '<div class="role-mark"><div class="rm-icon">' + icon('workshop', 20) + '</div><div><h3>Чистка</h3><div class="t-body" style="font-size:13px;">Видит, сколько куриц приедет, кто везёт и через сколько минут они будут в цеху.</div></div></div>' +
        '</div>' +
      '</section>' +
      '<section class="entry-side">' +
        '<div class="map-frame">' +
          '<div class="t-label t-label-amber">Как это работает</div>' +
          '<div style="border:1px solid var(--border);">' + cityDecorSvg() + '</div>' +
        '</div>' +
        '<div>' + authStepperHtml() + '<div class="mt-16">' + authPanelHtml() + '</div></div>' +
      '</section>' +
    '</div>' +
    '<footer class="entry-bar" style="border-top:1px solid var(--border);border-bottom:0;">' +
      '<div class="t-label">КУРОВОЗ · данные хранятся на сервере оператора</div>' +
      '<div class="t-label">Чат для согласования цены · живая карта · реквизиты</div>' +
    '</footer>' +
  '</div>';
  var first = $('.reg-card input');
  if (first) first.focus();
}

function renderOffline(){
  $('#app').innerHTML =
    '<div class="entry"><header class="entry-bar"><div class="brand">' +
    '<div class="brand-mark">' + icon('chicken', 20) + '</div><div class="brand-name">Куро<em>воз</em></div></div></header>' +
    '<div style="padding:48px var(--gutter);max-width:640px;">' +
      '<div class="panel"><div class="t-label t-label-amber">Нет связи с сервером</div>' +
      '<h1 class="t-heading mt-8">Запустите сервер</h1>' +
      '<p class="t-body mt-8">Приложение обращается к API <span class="t-data">/api/...</span>. Откройте терминал в папке проекта и выполните:</p>' +
      '<pre class="t-data mt-16" style="background:var(--surface-2);padding:16px;border:1px solid var(--border);overflow:auto;">cd kurovoz\nnpm install\nnpm start</pre>' +
      '<p class="t-body mt-16">Затем откройте <span class="t-data">http://localhost:3000</span> и обновите страницу.</p>' +
      '<button class="btn btn-primary mt-24" data-action="retry-boot">Повторить подключение</button></div>' +
    '</div></div>';
}

/* ============================================================
   6. КОМПОНЕНТЫ
   ============================================================ */
function personRow(u, roleTag){
  if (!u) return '';
  var key = u.id;
  var open = !!S.showReq[key];
  return '<div class="person-row">' +
    '<div class="avatar">' + esc((u.name || '?').trim().charAt(0).toUpperCase()) + '</div>' +
    '<div class="pr-main">' +
      '<div class="pr-name">' + esc(u.name) + '</div>' +
      '<div class="pr-phone">' + esc(u.phone || u.email || '') + '</div>' +
    '</div>' +
    '<div class="row-wrap">' +
      '<span class="badge badge-muted">' + esc(roleTag || ROLE_LABEL[u.role] || '') + '</span>' +
      '<button class="btn-ghost" data-action="toggle-req" data-user="' + esc(key) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        icon('card', 18) + ' ' + (open ? 'Скрыть реквизиты' : 'Показать реквизиты') +
      '</button>' +
    '</div>' +
    (open ?
      '<div class="reqs">' +
        '<div class="rq-row"><span class="rq-k">Банк</span><span class="rq-v">' + esc(u.bank) + '</span></div>' +
        '<div class="rq-row"><span class="rq-k">Карта / счёт</span><span class="rq-v">' + esc(fmtCardFull(u.card)) + '</span></div>' +
        '<div class="rq-row"><span class="rq-k">Получатель</span><span class="rq-v">' + esc(u.recipient) + '</span></div>' +
        (u.address ? '<div class="rq-row"><span class="rq-k">Адрес</span><span class="rq-v">' + esc(u.address) + '</span></div>' : '') +
      '</div>' : '') +
  '</div>';
}

function stateBadge(o){
  var cls = (o.state === 'done' || o.state === 'arrived') ? 'badge-ok'
    : (o.state === 'cancelled') ? 'badge-alert' : 'badge-new';
  return '<span class="badge ' + cls + ' stamp"><span class="dot"></span>' + esc(STATE_LABEL[o.state] || o.state) + '</span>';
}
function workshopBadge(o){
  if (o.workshopStatus === 'accepted') return '<span class="badge badge-ok">Цех принял</span>';
  if (o.workshopStatus === 'declined') return '<span class="badge badge-alert">Цех отклонил</span>';
  return '<span class="badge badge-muted">Цех: ожидает решения</span>';
}

function orderCardHtml(o, mode){
  var actions = '';
  if (mode === 'client') {
    actions =
      '<button class="btn btn-secondary" data-action="open-chat" data-order="' + esc(o.id) + '">' + icon('chat', 18) + ' Написать перевозчику</button>' +
      '<button class="btn btn-secondary" data-action="open-route" data-order="' + esc(o.id) + '">' + icon('route', 18) + ' Открыть маршрут</button>' +
      (o.state !== 'done' && o.state !== 'cancelled' ?
        '<button class="btn btn-danger" data-action="cancel-order" data-order="' + esc(o.id) + '">' + icon('x', 18) + ' Отменить</button>' : '');
  } else if (mode === 'carrier-incoming') {
    actions =
      '<button class="btn-accept-zone" data-action="accept-order" data-order="' + esc(o.id) + '">' + icon('check', 20) + ' Принять заказ · ' + money(o.total) + '</button>' +
      '<div class="row" style="gap:12px;flex:1;">' +
        '<button class="btn btn-secondary" style="flex:1" data-action="decline-order" data-order="' + esc(o.id) + '">' + icon('x', 18) + ' Не подходит</button>' +
        '<button class="btn btn-secondary" style="flex:1" data-action="open-chat" data-order="' + esc(o.id) + '">' + icon('chat', 18) + ' Написать клиенту</button>' +
      '</div>';
  } else if (mode === 'carrier-active') {
    actions =
      (o.state === 'to_pickup' ?
        '<button class="btn-accept-zone" data-action="set-status" data-order="' + esc(o.id) + '" data-state="in_transit">' + icon('truck', 20) + ' Загрузился, еду в цех</button>' : '') +
      (o.state === 'in_transit' ?
        '<button class="btn-accept-zone" data-action="set-status" data-order="' + esc(o.id) + '" data-state="arrived">' + icon('check', 20) + ' Прибыл в цех</button>' : '') +
      '<button class="btn btn-secondary" data-action="open-route" data-order="' + esc(o.id) + '">' + icon('route', 18) + ' Открыть маршрут</button>' +
      '<button class="btn btn-secondary" data-action="open-chat" data-order="' + esc(o.id) + '">' + icon('chat', 18) + ' Чат с клиентом</button>';
  } else if (mode === 'workshop') {
    actions =
      (o.workshopStatus === 'pending' ?
        '<button class="btn-accept-zone" data-action="workshop-decision" data-order="' + esc(o.id) + '" data-decision="accept">' + icon('check', 20) + ' Принять заказ в цех</button>' +
        '<button class="btn btn-danger btn-block" data-action="workshop-decision" data-order="' + esc(o.id) + '" data-decision="decline">' + icon('x', 18) + ' Отклонить</button>' +
        '<button class="btn btn-secondary btn-block" data-action="open-chat" data-order="' + esc(o.id) + '">' + icon('chat', 18) + ' Написать клиенту</button>'
      :
        '<button class="btn btn-secondary" data-action="open-route" data-order="' + esc(o.id) + '">' + icon('route', 18) + ' Открыть маршрут</button>' +
        '<button class="btn btn-secondary" data-action="open-chat" data-order="' + esc(o.id) + '">' + icon('chat', 18) + ' Чат с клиентом</button>');
  }

  return '<article class="card order-card">' +
    '<div class="oc-top">' +
      '<div class="col gap-4">' +
        '<div class="oc-id">Заказ ' + esc(o.id) + '</div>' +
        '<div class="oc-title">' + o.qty + ' ' + chickenWord(o.qty) + '</div>' +
        '<div class="oc-sub">' + money(o.pricePer) + ' за 1 курицу · итого ' + money(o.total) + '</div>' +
      '</div>' +
      '<div class="col gap-8" style="align-items:flex-end;">' + stateBadge(o) + workshopBadge(o) + '</div>' +
    '</div>' +
    '<div class="route-row">' +
      '<div class="route-line"></div>' +
      '<div class="route-points">' +
        '<div><div class="t-label">Погрузка</div><div class="rp-val">' + esc(o.pickup) + '</div></div>' +
        '<div><div class="t-label">Чистка (цех)</div><div class="rp-val">' + esc(o.workshopAddress) + '</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="meta-grid">' +
      '<div class="mg-item"><div class="t-label">Количество</div><div class="mg-val">' + o.qty + ' шт</div></div>' +
      '<div class="mg-item"><div class="t-label">Цена за 1 курицу</div><div class="mg-val accent">' + money(o.pricePer) + '</div></div>' +
      '<div class="mg-item"><div class="t-label">Итого для перевозчика</div><div class="mg-val">' + money(o.total) + '</div></div>' +
    '</div>' +
    (o.comment ? '<div class="t-body" style="font-size:13px;">Комментарий: «' + esc(o.comment) + '»</div>' : '') +
    (o.myRole !== 'client' && o.client ? personRow(o.client, 'Клиент') : '') +
    (o.carrier ? personRow(o.carrier, 'Перевозчик') :
      '<div class="person-row"><div class="pr-main"><div class="pr-name muted">Перевозчик не назначен</div><div class="pr-phone">Заказ ждёт отклика</div></div></div>') +
    (o.myRole !== 'workshop' && o.workshop ? personRow(o.workshop, 'Чистка') : '') +
    '<div class="oc-actions">' + actions + '</div>' +
  '</article>';
}

/* ============================================================
   7. ЭКРАНЫ
   ============================================================ */
function focusOrder(){
  return S.orders.filter(function(o){ return o.state === 'in_transit' || o.state === 'to_pickup'; })[0]
    || S.orders.filter(function(o){ return o.state !== 'cancelled' && o.state !== 'done'; })[0]
    || S.orders[0] || null;
}

function viewClient(){
  var active = S.orders.filter(function(o){ return o.state !== 'done' && o.state !== 'cancelled'; });
  var history = S.orders.filter(function(o){ return o.state === 'done' || o.state === 'cancelled'; });
  var fo = focusOrder();
  var wsOptions = (S.workshops || []).map(function(w){
    return '<option value="' + esc(w.id) + '">' + esc(w.name) + (w.address ? ' — ' + esc(w.address) : '') + '</option>';
  }).join('');

  var newForm = S.newOrderOpen ?
    '<form class="panel mt-16 field-group" data-form="new-order" id="new-order-form" novalidate>' +
      '<div class="row" style="justify-content:space-between;">' +
        '<div class="t-label t-label-amber">Новый заказ</div>' +
        '<button type="button" class="btn-ghost" data-action="toggle-new-order">' + icon('x', 18) + ' Закрыть</button>' +
      '</div>' +
      '<div class="field-row">' +
        '<div class="field">' +
          '<label class="t-label" for="no-qty">Количество куриц</label>' +
          '<div class="suffix-wrap"><input class="input input-num js-calc" id="no-qty" name="qty" inputmode="numeric" value="120"><span class="suffix">шт</span></div>' +
          '<div class="err" data-err="qty"></div>' +
        '</div>' +
        '<div class="field">' +
          '<label class="t-label" for="no-price">Цена перевозчику за 1 курицу</label>' +
          '<div class="suffix-wrap"><input class="input input-num js-calc" id="no-price" name="price" inputmode="numeric" value="15"><span class="suffix">₽</span></div>' +
          '<div class="err" data-err="price"></div>' +
        '</div>' +
      '</div>' +
      '<div class="panel" style="background:var(--surface-2);padding:16px;">' +
        '<div class="t-label">Итого для перевозчика</div>' +
        '<div class="big-num-row mt-8"><div class="t-metric amber js-total">1 800 ₽</div>' +
        '<div class="t-body" style="font-size:13px;">Цена за 1 курицу × Количество куриц</div></div>' +
      '</div>' +
      '<div class="field">' +
        '<label class="t-label" for="no-pickup">Адрес получения</label>' +
        '<div class="row" style="gap:8px;">' +
          '<input class="input" id="no-pickup" name="pickup" placeholder="Москва, ул. Ленина, 24" style="flex:1;">' +
          '<button type="button" class="btn btn-secondary" data-action="use-my-geo" title="Подставить моё местоположение">' + icon('locate', 18) + '</button>' +
        '</div>' +
        '<div class="hint">Можно подставить координаты — так перевозчик найдёт вас точнее.</div>' +
        '<div class="err" data-err="pickup"></div>' +
        '<input type="hidden" name="pickupLat" value=""><input type="hidden" name="pickupLng" value="">' +
      '</div>' +
      '<div class="field">' +
        '<label class="t-label" for="no-workshop">Цех (чистка)</label>' +
        '<select class="select" id="no-workshop" name="workshopId">' +
          '<option value="">— выбрать цех —</option>' + wsOptions +
        '</select>' +
        '<input class="input mt-8" name="workshopAddress" placeholder="Или укажите адрес чистки вручную">' +
        '<div class="hint">Заказ придёт перевозчикам и в выбранный цех.</div>' +
        '<div class="err" data-err="workshop"></div>' +
      '</div>' +
      '<div class="field">' +
        '<label class="t-label" for="no-comment">Комментарий</label>' +
        '<textarea class="textarea" id="no-comment" name="comment" placeholder="Например: звонить за 10 минут, клетки у подъезда"></textarea>' +
      '</div>' +
      '<div class="row-wrap">' +
        '<button class="btn btn-primary" type="submit">' + icon('send', 18) + ' Отправить заказ перевозчикам и в цех</button>' +
        '<button class="btn btn-secondary" type="button" data-action="toggle-new-order">Отмена</button>' +
      '</div>' +
    '</form>' : '';

  return '' +
  '<div class="page-head">' +
    '<div class="ph-row">' +
      '<div class="col gap-8">' +
        '<div class="t-label t-label-amber">Рабочая станция</div>' +
        '<h1 class="t-display-sm">Заказ</h1>' +
        '<p class="t-body">Соберите заказ и назначьте цену перевозчику.</p>' +
      '</div>' +
      '<button class="btn btn-primary" data-action="toggle-new-order" style="border:1px solid var(--voltage);">' + icon('plus', 18) + ' Новый заказ</button>' +
    '</div>' + newForm +
  '</div>' +
  '<div class="work-grid">' +
    '<div class="col gap-16">' +
      '<div class="section-head"><div class="t-label">Активные заказы · ' + active.length + '</div></div>' +
      (active.length ?
        '<div class="order-list">' + active.map(function(o, i){
          return '<div class="intake intake-' + Math.min(3, i + 1) + '">' + orderCardHtml(o, 'client') + '</div>';
        }).join('') + '</div>'
        : '<div class="empty">' + icon('box', 24) + '<div class="t-body">Активных заказов нет</div>' +
          '<button class="btn btn-primary" data-action="toggle-new-order">Создать первый заказ</button></div>') +
      (history.length ?
        '<div class="section"><div class="section-head"><div class="t-label">История</div></div>' +
        '<div class="order-list">' + history.map(function(o){ return orderCardHtml(o, 'client'); }).join('') + '</div></div>' : '') +
    '</div>' +
    '<div class="col gap-16">' +
      (fo ? mapFrameHtml(fo) :
        '<div class="empty">' + icon('pin', 24) + '<div class="t-body">Маршрут появится после создания заказа</div></div>') +
    '</div>' +
  '</div>';
}

function viewCarrier(){
  var incoming = S.orders.filter(function(o){ return o.state === 'awaiting_carrier' && o.myRole !== 'client'; });
  var active = S.orders.filter(function(o){
    return o.myRole === 'carrier' && (o.state === 'to_pickup' || o.state === 'in_transit' || o.state === 'arrived');
  });
  var done = S.orders.filter(function(o){ return o.myRole === 'carrier' && o.state === 'done'; });
  var earned = done.reduce(function(s, o){ return s + o.total; }, 0);
  var fo = active[0] || incoming[0] || null;

  return '' +
  '<div class="page-head">' +
    '<div class="ph-row">' +
      '<div class="col gap-8">' +
        '<div class="t-label t-label-amber">Рабочая станция</div>' +
        '<h1 class="t-display-sm">Работа</h1>' +
        '<p class="t-body">Принимайте заказы, которые вам удобно везти.</p>' +
      '</div>' +
    '</div>' +
    '<div class="metric-band">' +
      '<div class="metric-cell"><div class="t-label">Новых заказов</div><div class="t-metric amber">' + incoming.length + '</div><div class="t-body" style="font-size:13px;">ждут перевозчика</div></div>' +
      '<div class="metric-cell"><div class="t-label">В пути</div><div class="t-metric">' + active.length + '</div><div class="t-body" style="font-size:13px;">активных рейсов</div></div>' +
      '<div class="metric-cell"><div class="t-label">Заработано</div><div class="t-metric">' + money(earned) + '</div><div class="t-body" style="font-size:13px;">по завершённым заказам</div></div>' +
    '</div>' +
  '</div>' +
  '<div class="work-grid">' +
    '<div class="col gap-16">' +
      '<div class="section-head"><div class="t-label">Входящие заказы · ' + incoming.length + '</div></div>' +
      (incoming.length ?
        '<div class="order-list">' + incoming.map(function(o, i){
          return '<div class="intake intake-' + Math.min(3, i + 1) + '">' + orderCardHtml(o, 'carrier-incoming') + '</div>';
        }).join('') + '</div>'
        : '<div class="empty">' + icon('truck', 24) + '<div class="t-body">Новых заказов нет. Уведомление придёт, как только клиент создаст заявку.</div></div>') +
      (active.length ?
        '<div class="section"><div class="section-head"><div class="t-label">Активные рейсы</div></div>' +
        '<div class="order-list">' + active.map(function(o){ return orderCardHtml(o, 'carrier-active'); }).join('') + '</div></div>' : '') +
      (done.length ?
        '<div class="section"><div class="section-head"><div class="t-label">Завершённые</div></div>' +
        '<div class="order-list">' + done.map(function(o){ return orderCardHtml(o, 'carrier-active'); }).join('') + '</div></div>' : '') +
    '</div>' +
    '<div class="col gap-16">' +
      (fo ? mapFrameHtml(fo) :
        '<div class="empty">' + icon('pin', 24) + '<div class="t-body">Маршрут появится после принятия заказа</div></div>') +
      '<div class="panel">' +
        '<div class="t-label">Ваши реквизиты для оплаты</div>' +
        '<div class="kv-list mt-8">' +
          '<div class="kv"><span class="kv-k">Имя</span><span class="kv-v">' + esc(S.me.name) + '</span></div>' +
          '<div class="kv"><span class="kv-k">Телефон</span><span class="kv-v">' + esc(S.me.phone || S.me.email) + '</span></div>' +
          '<div class="kv"><span class="kv-k">Банк</span><span class="kv-v">' + esc(S.me.bank) + '</span></div>' +
          '<div class="kv"><span class="kv-k">Карта</span><span class="kv-v">' + esc(maskCard(S.me.card)) + '</span></div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block mt-16" data-action="nav" data-view="profile">' + icon('edit', 18) + ' Редактировать профиль</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function viewWorkshop(){
  var incoming = S.orders.filter(function(o){
    return o.myRole === 'workshop' && o.state !== 'done' && o.state !== 'cancelled';
  });
  var history = S.orders.filter(function(o){
    return o.myRole === 'workshop' && (o.state === 'done' || o.state === 'cancelled');
  });
  var waiting = incoming.reduce(function(s, o){ return s + o.qty; }, 0);
  var today = S.orders.filter(function(o){
    return o.myRole === 'workshop' && (Date.now() - o.createdAt) < 24 * 3600 * 1000;
  }).length;
  var moving = incoming.filter(function(o){ return o.state === 'to_pickup' || o.state === 'in_transit'; })
    .sort(function(a, b){ return (a.etaMin == null ? 999 : a.etaMin) - (b.etaMin == null ? 999 : b.etaMin); });
  var nearest = moving[0];
  var fo = nearest || incoming[0] || null;

  return '' +
  '<div class="page-head">' +
    '<div class="ph-row">' +
      '<div class="col gap-8">' +
        '<div class="t-label t-label-amber">Рабочая станция</div>' +
        '<h1 class="t-display-sm">Цех</h1>' +
        '<p class="t-body">Знайте, сколько куриц приедет и когда.</p>' +
      '</div>' +
    '</div>' +
    '<div class="metric-band">' +
      '<div class="metric-cell"><div class="t-label">Куриц ожидают чистки</div><div class="t-metric amber">' + waiting + '</div><div class="t-body" style="font-size:13px;">' + plural(waiting, ['курица','курицы','куриц']) + ' в активных заказах</div></div>' +
      '<div class="metric-cell"><div class="t-label">Заказов сегодня</div><div class="t-metric">' + today + '</div><div class="t-body" style="font-size:13px;">поступило в цех</div></div>' +
      '<div class="metric-cell"><div class="t-label">Ближайшее прибытие</div><div class="t-metric' + (nearest ? ' amber' : '') + '">' +
        (nearest ? (nearest.etaMin == null ? '—' : nearest.etaMin + '<small>мин</small>') : '—') + '</div>' +
        '<div class="t-body" style="font-size:13px;">' + (nearest ? esc(nearest.id) + ' · ' + nearest.qty + ' ' + chickenWord(nearest.qty) : 'маршрутов в пути нет') + '</div></div>' +
    '</div>' +
  '</div>' +
  (fo ? '<div style="margin-bottom:32px;">' + mapFrameHtml(fo, true) + '</div>' : '') +
  '<div class="section-head"><div class="t-label">Входящие партии · ' + incoming.length + '</div>' +
    '<div class="t-data muted">Принимайте или отклоняйте заказ</div></div>' +
  (incoming.length ?
    '<div class="order-list">' + incoming.map(function(o, i){
      return '<div class="intake intake-' + Math.min(3, i + 1) + '">' + orderCardHtml(o, 'workshop') + '</div>';
    }).join('') + '</div>'
    : '<div class="empty">' + icon('workshop', 24) + '<div class="t-body">Входящих партий нет</div></div>') +
  (history.length ?
    '<div class="section"><div class="section-head"><div class="t-label">История цеха</div></div>' +
    '<div class="order-list">' + history.map(function(o){ return orderCardHtml(o, 'workshop'); }).join('') + '</div></div>' : '');
}

function viewMap(){
  var list = S.orders.filter(function(o){ return o.state !== 'cancelled'; });
  var fo = focusOrder();
  return '' +
  '<div class="page-head"><div class="col gap-8">' +
    '<div class="t-label t-label-amber">Пространство</div>' +
    '<h1 class="t-display-sm">Карта</h1>' +
    '<p class="t-body">Живое положение перевозчика и маршрут до цеха.</p>' +
  '</div></div>' +
  (fo ? mapFrameHtml(fo, true) : '<div class="empty">' + icon('pin', 24) + '<div class="t-body">Маршрутов пока нет</div></div>') +
  '<div class="section">' +
    '<div class="section-head"><div class="t-label">Маршруты</div></div>' +
    (list.length ?
      '<div class="order-list">' + list.map(function(o){
        return '<button class="card row" style="width:100%;text-align:left;justify-content:space-between;gap:16px;" data-action="open-route" data-order="' + esc(o.id) + '">' +
          '<div class="col gap-4">' +
            '<div class="oc-id">' + esc(o.id) + '</div>' +
            '<div class="t-strong">' + o.qty + ' ' + chickenWord(o.qty) + ' · ' + money(o.pricePer) + ' / шт</div>' +
            '<div class="t-body" style="font-size:13px;">' + esc(o.pickup) + ' → ' + esc(o.workshopAddress) + '</div>' +
          '</div>' +
          '<div class="col gap-8" style="align-items:flex-end;">' +
            stateBadge(o) +
            '<span class="t-data amber">' + (o.etaMin == null ? 'ETA —' : o.etaMin + ' мин') + '</span>' +
          '</div>' +
        '</button>';
      }).join('') + '</div>'
      : '<div class="empty">' + icon('pin', 24) + '<div class="t-body">Маршрутов пока нет</div></div>') +
  '</div>';
}

function viewChat(){
  var convs = S.orders.filter(function(o){ return o.myRole; });
  if (!S.chatOrderId && convs.length) S.chatOrderId = convs[0].id;
  if (S.chatOrderId && !convs.some(function(o){ return o.id === S.chatOrderId; })) {
    S.chatOrderId = convs.length ? convs[0].id : null;
  }
  var current = S.orders.filter(function(o){ return o.id === S.chatOrderId; })[0] || null;

  var convHtml = convs.map(function(o){
    var other = o.myRole === 'client' ? (o.carrier || o.workshop) : o.client;
    return '<button class="chat-conv' + (current && current.id === o.id ? ' is-on' : '') + '" data-action="open-chat" data-order="' + esc(o.id) + '">' +
      '<div class="cc-title">' + esc((other && other.name) || 'Заказ ' + o.id) + '</div>' +
      '<div class="cc-sub">' + esc(o.id) + ' · ' + o.qty + ' ' + chickenWord(o.qty) + '</div>' +
    '</button>';
  }).join('');

  var thread = '';
  if (current) {
    var other = current.myRole === 'client' ? (current.carrier || current.workshop) : current.client;
    var msgs = S.messages;
    thread =
    '<div class="chat-main">' +
      '<div class="chat-head">' +
        '<div class="col gap-4">' +
          '<div class="t-heading-sm">' + esc((other && other.name) || 'Заказ ' + current.id) + '</div>' +
          '<div class="t-data muted">' + esc(current.id) + ' · ' + esc((other && (other.phone || other.email)) || '') + '</div>' +
        '</div>' +
        '<div class="row-wrap">' + stateBadge(current) +
          '<button class="btn btn-secondary" data-action="open-route" data-order="' + esc(current.id) + '">' + icon('route', 18) + ' Маршрут</button>' +
        '</div>' +
      '</div>' +
      '<div class="chat-context">' +
        '<span class="chip">Решение по цене</span>' +
        '<span class="t-data">1 курица = ' + money(current.pricePer) + '</span><span class="muted">·</span>' +
        '<span class="t-data">' + current.qty + ' ' + chickenWord(current.qty) + ' · итого ' + money(current.total) + '</span>' +
      '</div>' +
      '<div class="msgs" id="msgs">' +
        (msgs.length ? msgs.map(function(m){
          return '<div class="msg ' + (m.fromMe ? 'mine' : 'theirs') + '">' +
            (m.priceChip ? '<div><span class="chip">Решение по цене</span></div>' : '') +
            '<div class="m-text">' + esc(m.text) + '</div>' +
            '<div class="m-meta"><span>' + esc(m.fromMe ? 'Вы' : m.fromName) + '</span><span>' + fmtTime(m.ts) + '</span></div>' +
          '</div>';
        }).join('') : '<div class="empty">' + icon('chat', 24) + '<div class="t-body">Сообщений пока нет. Договоритесь о цене и времени.</div></div>') +
      '</div>' +
      '<form class="chat-compose" data-form="chat-send" novalidate>' +
        '<textarea class="textarea" name="text" rows="1" placeholder="Сообщение по заказу…" aria-label="Сообщение по заказу"></textarea>' +
        '<button class="btn btn-primary" type="submit">' + icon('send', 18) + ' Отправить</button>' +
      '</form>' +
      '<div class="row-wrap" style="padding:0 20px 16px;">' +
        '<button class="btn btn-secondary" data-action="quick-price" data-order="' + esc(current.id) + '" data-delta="-1">Цена −1 ₽</button>' +
        '<button class="btn btn-secondary" data-action="quick-price" data-order="' + esc(current.id) + '" data-delta="1">Цена +1 ₽</button>' +
        '<button class="btn btn-secondary" data-action="quick-price" data-order="' + esc(current.id) + '" data-delta="0">Зафиксировать ' + money(current.pricePer) + '</button>' +
      '</div>' +
    '</div>';
  }

  return '' +
  '<div class="page-head"><div class="col gap-8">' +
    '<div class="t-label t-label-amber">Согласование</div>' +
    '<h1 class="t-display-sm">Чат</h1>' +
    '<p class="t-body">Договоритесь о цене и времени — контакты и реквизиты участников в карточке заказа.</p>' +
  '</div></div>' +
  '<div class="chat-layout">' +
    '<div class="chat-list"><div class="chat-list-head"><div class="t-label">Заказы</div></div>' +
      (convs.length ? convHtml : '<div class="empty" style="margin:12px;">' + icon('chat', 22) + '<div class="t-body">Диалогов нет</div></div>') +
    '</div>' +
    (thread || '<div class="chat-main"><div class="empty" style="margin:auto;">' + icon('chat', 24) + '<div class="t-body">Выберите заказ слева</div></div></div>') +
  '</div>';
}

function viewProfile(){
  var me = S.me;
  var showCard = !!S.showReq['me-card'];
  return '' +
  '<div class="page-head"><div class="col gap-8">' +
    '<div class="t-label t-label-amber">Аккаунт</div>' +
    '<h1 class="t-display-sm">Профиль</h1>' +
    '<p class="t-body">Имя, контакты и реквизиты видят участники ваших заказов. Для цеха дополнительно виден адрес.</p>' +
  '</div></div>' +
  '<div class="profile-grid">' +
    '<div class="panel">' +
      '<div class="row" style="justify-content:space-between;gap:16px;flex-wrap:wrap;">' +
        '<div class="row">' +
          '<div class="avatar" style="width:48px;height:48px;font-size:18px;">' + esc(me.name.charAt(0).toUpperCase()) + '</div>' +
          '<div class="col gap-4">' +
            '<div class="t-heading">' + esc(me.name) + '</div>' +
            '<span class="badge badge-new">' + esc(ROLE_LABEL[me.role]) + '</span>' +
          '</div>' +
        '</div>' +
        '<button class="btn btn-secondary" data-action="toggle-edit-profile">' + icon('edit', 18) + ' Редактировать</button>' +
      '</div>' +
      '<div class="kv-list mt-16">' +
        '<div class="kv"><span class="kv-k">Имя</span><span class="kv-v">' + esc(me.name) + '</span></div>' +
        '<div class="kv"><span class="kv-k">Телефон</span><span class="kv-v">' + esc(me.phone || '—') + '</span></div>' +
        '<div class="kv"><span class="kv-k">E-mail</span><span class="kv-v">' + esc(me.email || '—') + '</span></div>' +
        '<div class="kv"><span class="kv-k">Банк</span><span class="kv-v">' + esc(me.bank) + '</span></div>' +
        '<div class="kv"><span class="kv-k">Карта / счёт</span><span class="kv-v">' + esc(showCard ? fmtCardFull(me.card) : maskCard(me.card)) + '</span></div>' +
        '<div class="kv"><span class="kv-k">Получатель</span><span class="kv-v wrap">' + esc(me.recipient) + '</span></div>' +
        (me.address ? '<div class="kv"><span class="kv-k">Адрес цеха</span><span class="kv-v wrap">' + esc(me.address) + '</span></div>' : '') +
      '</div>' +
      '<div class="row-wrap mt-16">' +
        '<button class="btn btn-secondary" data-action="toggle-req" data-user="me-card">' + icon(showCard ? 'eyeOff' : 'eye', 18) + ' ' + (showCard ? 'Скрыть реквизиты' : 'Показать реквизиты') + '</button>' +
        '<button class="btn btn-danger" data-action="logout">' + icon('logout', 18) + ' Выйти</button>' +
      '</div>' +
    '</div>' +
    '<div class="col gap-24">' +
      (S.editProfile ?
        '<form class="panel field-group" data-form="edit-profile" novalidate>' +
          '<div class="row" style="justify-content:space-between;">' +
            '<div class="t-label t-label-amber">Редактирование профиля</div>' +
            '<button type="button" class="btn-ghost" data-action="toggle-edit-profile">' + icon('x', 18) + ' Закрыть</button>' +
          '</div>' +
          '<div class="field"><label class="t-label" for="ep-name">Имя</label>' +
            '<input class="input" id="ep-name" name="name" value="' + esc(me.name) + '"></div>' +
          '<div class="field-row">' +
            '<div class="field"><label class="t-label" for="ep-bank">Банк</label>' +
              '<input class="input" id="ep-bank" name="bank" value="' + esc(me.bank) + '"></div>' +
            '<div class="field"><label class="t-label" for="ep-card">Номер карты или счёта</label>' +
              '<input class="input input-num" id="ep-card" name="card" value="' + esc(fmtCardFull(me.card)) + '"></div>' +
          '</div>' +
          '<div class="field"><label class="t-label" for="ep-recipient">Получатель</label>' +
            '<input class="input" id="ep-recipient" name="recipient" value="' + esc(me.recipient) + '"></div>' +
          '<div class="field"><label class="t-label" for="ep-email">E-mail (для входа и уведомлений)</label>' +
            '<input class="input" id="ep-email" name="email" type="email" value="' + esc(me.email || '') + '"></div>' +
          '<div class="field"><label class="t-label" for="ep-address">Адрес цеха (для роли «Чистка»)</label>' +
            '<input class="input" id="ep-address" name="address" value="' + esc(me.address || '') + '"></div>' +
          '<div class="field"><label class="t-label" for="ep-role">Роль</label>' +
            '<select class="select" id="ep-role" name="role">' +
              ['client','carrier','workshop'].map(function(r){
                return '<option value="' + r + '"' + (me.role === r ? ' selected' : '') + '>' + esc(ROLE_LABEL[r]) + '</option>';
              }).join('') +
            '</select></div>' +
          '<button class="btn btn-primary" type="submit">' + icon('check', 18) + ' Сохранить</button>' +
        '</form>'
        :
        '<div class="panel">' +
          '<div class="t-label">Кто что видит</div>' +
          '<div class="kv-list mt-8">' +
            '<div class="kv"><span class="kv-k">Клиент</span><span class="kv-v" style="font-family:var(--font-body);font-weight:400;text-align:right;">Видит имя, контакты и реквизиты перевозчика и цеха</span></div>' +
            '<div class="kv"><span class="kv-k">Перевозчик</span><span class="kv-v" style="font-family:var(--font-body);font-weight:400;text-align:right;">Видит имя, контакты и реквизиты клиента</span></div>' +
            '<div class="kv"><span class="kv-k">Чистка</span><span class="kv-v" style="font-family:var(--font-body);font-weight:400;text-align:right;">Видит имя, контакты и реквизиты клиента, а также маршрут</span></div>' +
          '</div>' +
        '</div>') +
    '</div>' +
  '</div>';
}

function workspaceHtml(){
  if (S.view === 'map') return viewMap();
  if (S.view === 'chat') return viewChat();
  if (S.view === 'profile') return viewProfile();
  if (S.me.role === 'carrier') return viewCarrier();
  if (S.me.role === 'workshop') return viewWorkshop();
  return viewClient();
}

/* ============================================================
   8. ОБОЛОЧКА
   ============================================================ */
function railHtml(){
  var nav = [
    { view: 'orders', label: 'Заказы', icon: 'box' },
    { view: 'map', label: 'Карта', icon: 'pin' },
    { view: 'chat', label: 'Чат', icon: 'chat' },
    { view: 'profile', label: 'Профиль', icon: 'user' }
  ];
  return '<aside class="rail">' +
    '<div class="brand"><div class="brand-mark">' + icon('chicken', 20) + '</div><div class="brand-name">Куро<em>воз</em></div></div>' +
    '<div class="rail-role">' +
      '<div class="row" style="justify-content:space-between;"><div class="t-label">Роль</div>' +
      '<div class="badge badge-new">' + esc(ROLE_LABEL[S.me.role]) + '</div></div>' +
      '<div class="t-strong" style="font-size:13px;">' + esc(S.me.name) + '</div>' +
      '<div class="t-data" style="font-size:12px;color:var(--ink-muted);">' + esc(S.me.phone || S.me.email) + '</div>' +
    '</div>' +
    '<nav class="rail-nav" aria-label="Разделы">' +
      nav.map(function(n){
        return '<button class="nav-item' + (S.view === n.view ? ' is-active' : '') + '" data-action="nav" data-view="' + n.view + '">' +
          icon(n.icon, 20) + ' ' + esc(n.label) + '</button>';
      }).join('') +
    '</nav>' +
    '<div class="rail-foot">' +
      '<button class="btn btn-secondary btn-block" data-action="logout">' + icon('logout', 18) + ' Выйти</button>' +
    '</div>' +
  '</aside>';
}
function utilBarHtml(){
  var unread = unreadCount();
  return '<header class="utilbar">' +
    '<div class="util-left">' +
      '<div class="util-role">' + icon(S.me.role === 'client' ? 'user' : S.me.role === 'carrier' ? 'truck' : 'workshop', 16) + ' ' + esc(ROLE_LABEL[S.me.role]) + '</div>' +
    '</div>' +
    '<div class="util-right">' +
      '<div class="util-user">' +
        '<div class="avatar">' + esc(S.me.name.charAt(0).toUpperCase()) + '</div>' +
        '<div class="col" style="gap:2px;min-width:0;">' +
          '<div class="uu-name">' + esc(S.me.name) + '</div>' +
          '<div class="uu-phone">' + esc(S.me.phone || S.me.email) + '</div>' +
        '</div>' +
      '</div>' +
      '<button class="icon-btn" data-action="toggle-notif" aria-label="Уведомления">' + icon('bell', 20) +
        (unread ? '<span class="unread"></span>' : '') + '</button>' +
    '</div>' +
  '</header>';
}
function mobileTopHtml(){
  var unread = unreadCount();
  return '<header class="mobile-top">' +
    '<button class="btn-ghost" data-action="toggle-menu" aria-label="Меню">' + icon('menu', 22) + '</button>' +
    '<div class="brand"><div class="brand-mark" style="width:28px;height:28px;">' + icon('chicken', 16) + '</div>' +
    '<div class="brand-name" style="font-size:20px;">Куро<em>воз</em></div></div>' +
    '<button class="icon-btn" data-action="toggle-notif" aria-label="Уведомления">' + icon('bell', 20) +
      (unread ? '<span class="unread"></span>' : '') + '</button>' +
  '</header>';
}
function bottomNavHtml(){
  var nav = [
    { view: 'orders', label: 'Заказы', icon: 'box' },
    { view: 'map', label: 'Карта', icon: 'pin' },
    { view: 'chat', label: 'Чат', icon: 'chat' },
    { view: 'profile', label: 'Профиль', icon: 'user' }
  ];
  return '<nav class="bottomnav">' + nav.map(function(n){
    return '<button class="bn-item' + (S.view === n.view ? ' is-active' : '') + '" data-action="nav" data-view="' + n.view + '">' +
      icon(n.icon, 20) + '<span>' + esc(n.label) + '</span></button>';
  }).join('') + '</nav>';
}
function notifDrawerHtml(){
  if (!S.drawerOpen) return '';
  var rows = S.notifications.length ? S.notifications.map(function(n){
    return '<div class="notif-row' + (n.read ? '' : ' is-unread') + '">' +
      '<div class="nr-text">' + esc(n.text) + '</div>' +
      '<div class="nr-meta"><span class="nr-time">' + esc(timeAgo(n.ts)) + (n.orderId ? ' · ' + esc(n.orderId) : '') + '</span>' +
      (n.orderId ? '<button class="btn-link" data-action="open-order-from-notif" data-order="' + esc(n.orderId) + '">Открыть</button>' : '') +
      '</div></div>';
  }).join('') : '<div class="empty" style="margin:20px;">' + icon('bell', 24) + '<div class="t-body">Уведомлений пока нет</div></div>';
  return '<div class="drawer-backdrop" data-action="close-overlay"></div>' +
  '<aside class="drawer" role="dialog" aria-label="Уведомления">' +
    '<div class="drawer-head"><div class="t-heading-sm">Уведомления</div>' +
      '<button class="icon-btn" data-action="close-overlay" aria-label="Закрыть">' + icon('x', 20) + '</button></div>' +
    '<div class="drawer-body">' + rows + '</div>' +
    '<div class="drawer-foot"><button class="btn btn-secondary btn-block" data-action="mark-read-all">Прочитать все</button></div>' +
  '</aside>';
}
function menuSheetHtml(){
  if (!S.menuOpen) return '';
  return '<div class="menu-sheet" data-action="close-overlay">' +
    '<div class="ms-panel" data-stop="1">' +
      '<div class="row" style="justify-content:space-between;">' +
        '<div class="brand"><div class="brand-mark">' + icon('chicken', 20) + '</div><div class="brand-name">Куро<em>воз</em></div></div>' +
        '<button class="icon-btn" data-action="close-overlay" aria-label="Закрыть">' + icon('x', 20) + '</button>' +
      '</div>' +
      '<div class="panel" style="padding:16px;">' +
        '<div class="t-label">Профиль</div>' +
        '<div class="t-strong mt-8">' + esc(S.me.name) + '</div>' +
        '<div class="t-data muted">' + esc(S.me.phone || S.me.email) + '</div>' +
        '<div class="badge badge-new mt-8">' + esc(ROLE_LABEL[S.me.role]) + '</div>' +
      '</div>' +
      '<button class="btn btn-secondary btn-block" data-action="logout">' + icon('logout', 18) + ' Выйти</button>' +
    '</div></div>';
}
function dialogHtml(){
  if (!S.dialog) return '';
  var d = S.dialog;
  return '<div class="dialog-wrap" data-action="close-overlay">' +
    '<div class="dialog" data-stop="1" role="dialog" aria-modal="true">' +
      '<div class="col gap-8">' +
        '<div class="t-label ' + (d.kind === 'alert' ? 'red' : 't-label-amber') + '">' + (d.kind === 'alert' ? 'Внимание' : 'Подтверждение') + '</div>' +
        '<h2 class="t-heading">' + esc(d.title) + '</h2>' +
        '<p class="t-body">' + esc(d.text) + '</p>' +
      '</div>' +
      '<div class="dialog-actions">' +
        '<button class="btn ' + (d.kind === 'alert' ? 'btn-danger' : 'btn-primary') + '" data-action="dialog-confirm">' + esc(d.confirmText || 'Подтвердить') + '</button>' +
        '<button class="btn btn-secondary" data-action="close-overlay">Отмена</button>' +
      '</div>' +
    '</div></div>';
}

/* ============================================================
   9. РЕНДЕР
   ============================================================ */
function render(){
  if (!S.me) return;
  var active = document.activeElement;
  var saved = null;
  if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT') && active.getAttribute('name')) {
    saved = {
      name: active.getAttribute('name'),
      val: active.value,
      sel: [active.selectionStart, active.selectionEnd],
      id: active.id
    };
  }
  destroyMap();
  $('#app').innerHTML =
    '<div class="shell">' + railHtml() + utilBarHtml() + mobileTopHtml() +
      '<main class="main" id="workspace">' + workspaceHtml() + '</main>' + bottomNavHtml() + '</div>';
  $('#overlay-root').innerHTML = notifDrawerHtml() + menuSheetHtml() + dialogHtml();

  var host = $('.js-leaflet');
  if (host) {
    var o = S.orders.filter(function(x){ return x.id === host.getAttribute('data-order'); })[0];
    if (o) mountOrderMap(host, o, host.classList.contains('leaflet-big'));
  }
  var msgs = $('#msgs');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;

  if (saved) {
    var el = saved.id ? document.getElementById(saved.id) : document.querySelector('[name="' + saved.name + '"]');
    if (el) {
      el.value = saved.val;
      if (el === document.activeElement || el.tagName === 'TEXTAREA') {
        try { el.focus(); el.setSelectionRange(saved.sel[0], saved.sel[1]); } catch (e) {}
      }
    }
  }
  var total = $('.js-total');
  if (total) recalcTotal();
}

function recalcTotal(){
  var q = $('#no-qty'), p = $('#no-price'), out = $('.js-total');
  if (!q || !p || !out) return;
  var qty = parseInt(String(q.value).replace(/\D/g, ''), 10) || 0;
  var price = parseInt(String(p.value).replace(/\D/g, ''), 10) || 0;
  out.textContent = money(qty * price);
}

/* ============================================================
   10. ДАННЫЕ / СИНХРОНИЗАЦИЯ
   ============================================================ */
var lastSyncJson = '';
async function sync(force){
  if (!S.me) return;
  try {
    var data = await api('/api/orders');
    var notif = await api('/api/notifications');
    S.orders = data.orders || [];
    S.notifications = notif.notifications || [];
    if (S.me.role === 'client') {
      var ws = await api('/api/workshops');
      S.workshops = ws.workshops || [];
    }
    S.offline = false;
    var sig = JSON.stringify([S.orders, S.notifications]);
    if (force || sig !== lastSyncJson) {
      lastSyncJson = sig;
      render();
    }
  } catch (err) {
    if (err.message === 'Нет связи с сервером') {
      S.offline = true;
      toast('Нет связи с сервером', 'alert');
    }
  }
}
async function loadMessages(orderId){
  try {
    var data = await api('/api/orders/' + encodeURIComponent(orderId) + '/messages');
    S.messages = data.messages || [];
    if (S.view === 'chat') {
      var box = $('#msgs');
      if (box) {
        var near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
        render();
        if (near) {
          var b2 = $('#msgs');
          if (b2) b2.scrollTop = b2.scrollHeight;
        }
      }
    }
  } catch (e) {}
}

var pollTimer = null, chatTimer = null, geoTimer = null;
function startPolling(){
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(function(){ sync(false); }, 5000);
  if (chatTimer) clearInterval(chatTimer);
  chatTimer = setInterval(function(){
    if (S.view === 'chat' && S.chatOrderId) loadMessages(S.chatOrderId);
  }, 4000);
  startGeo();
}
function startGeo(){
  if (geoTimer || !('geolocation' in navigator)) return;
  var push = function(){
    if (!S.me || S.me.role !== 'carrier') return;
    var activeOrder = S.orders.filter(function(o){
      return o.myRole === 'carrier' && (o.state === 'to_pickup' || o.state === 'in_transit');
    })[0];
    if (!activeOrder) return;
    navigator.geolocation.getCurrentPosition(function(pos){
      api('/api/orders/' + encodeURIComponent(activeOrder.id) + '/position', {
        method: 'POST',
        body: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed != null ? pos.coords.speed * 3.6 : null
        }
      }).catch(function(){});
    }, function(){ /* пользователь запретил геолокацию — молча продолжаем */ },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
  };
  geoTimer = setInterval(push, 20000);
  setTimeout(push, 3000);
}

/* ============================================================
   11. ДЕЙСТВИЯ
   ============================================================ */
function handleAction(action, el, ev){
  switch (action) {
    case 'wiz-channel':
      captureWizInputs();
      wiz.channel = el.getAttribute('data-channel');
      wiz.errors = {};
      renderAuth();
      break;
    case 'wiz-role': {
      captureWizInputs();
      wiz.role = el.getAttribute('data-role');
      wiz.errors.role = '';
      renderAuth();
      break;
    }
    case 'wiz-back':
      wiz.step = 'contact';
      wiz.errors = {};
      renderAuth();
      break;
    case 'wiz-resend':
      sendCode(true);
      break;
    case 'wiz-focus': {
      var inp = $('.reg-card input');
      if (inp) inp.focus();
      var card = $('.reg-card');
      if (card) card.scrollIntoView({ block: 'center' });
      break;
    }
    case 'retry-boot':
      boot();
      break;
    case 'nav':
      S.view = el.getAttribute('data-view');
      S.menuOpen = false;
      S.drawerOpen = false;
      render();
      if (S.view === 'chat' && S.chatOrderId) loadMessages(S.chatOrderId);
      break;
    case 'toggle-menu':
      S.menuOpen = !S.menuOpen;
      render();
      break;
    case 'toggle-notif':
      S.drawerOpen = !S.drawerOpen;
      if (S.drawerOpen) {
        api('/api/notifications/read').then(function(){
          S.notifications.forEach(function(n){ n.read = true; });
          render();
        }).catch(function(){});
      }
      render();
      break;
    case 'close-overlay':
      if (ev && ev.target.closest && ev.target.closest('[data-stop]')) return;
      S.drawerOpen = false;
      S.menuOpen = false;
      S.dialog = null;
      render();
      break;
    case 'mark-read-all':
      api('/api/notifications/read').then(function(){
        S.notifications.forEach(function(n){ n.read = true; });
        render();
      }).catch(function(){});
      break;
    case 'open-order-from-notif':
      S.drawerOpen = false;
      S.view = 'orders';
      render();
      break;
    case 'toggle-new-order':
      S.newOrderOpen = !S.newOrderOpen;
      render();
      if (S.newOrderOpen) {
        var f = $('#new-order-form');
        if (f && f.scrollIntoView) f.scrollIntoView({ block: 'nearest' });
      }
      break;
    case 'toggle-req': {
      var k = el.getAttribute('data-user');
      S.showReq[k] = !S.showReq[k];
      render();
      break;
    }
    case 'toggle-edit-profile':
      S.editProfile = !S.editProfile;
      render();
      break;
    case 'open-chat':
      S.chatOrderId = el.getAttribute('data-order');
      S.view = 'chat';
      S.drawerOpen = false;
      render();
      loadMessages(S.chatOrderId);
      break;
    case 'open-route':
      S.view = 'map';
      render();
      break;
    case 'use-my-geo':
      if (!('geolocation' in navigator)) { toast('Геолокация не поддерживается браузером', 'alert'); break; }
      navigator.geolocation.getCurrentPosition(function(pos){
        var lat = $('[name="pickupLat"]'), lng = $('[name="pickupLng"]'), addr = $('[name="pickup"]');
        if (lat) lat.value = pos.coords.latitude;
        if (lng) lng.value = pos.coords.longitude;
        if (addr && !addr.value) addr.value = 'Моё местоположение (' + pos.coords.latitude.toFixed(5) + ', ' + pos.coords.longitude.toFixed(5) + ')';
        toast('Координаты получены', 'ok');
      }, function(){
        toast('Не удалось получить местоположение. Разрешите доступ в браузере.', 'alert');
      }, { enableHighAccuracy: true, timeout: 12000 });
      break;

    case 'accept-order': {
      var oid = el.getAttribute('data-order');
      api('/api/orders/' + encodeURIComponent(oid) + '/accept', { method: 'POST' })
        .then(function(){
          toast('Заказ ' + oid + ' принят', 'ok');
          announce('Заказ ' + oid + ' принят. Маршрут построен.');
          return sync(true);
        })
        .catch(function(err){ toast(err.message, 'alert'); });
      break;
    }
    case 'decline-order': {
      var did = el.getAttribute('data-order');
      api('/api/orders/' + encodeURIComponent(did) + '/decline', { method: 'POST' })
        .then(function(){ toast('Заказ ' + did + ' пропущен', 'live'); return sync(true); })
        .catch(function(err){ toast(err.message, 'alert'); });
      break;
    }
    case 'set-status': {
      var sid = el.getAttribute('data-order');
      var st = el.getAttribute('data-state');
      api('/api/orders/' + encodeURIComponent(sid) + '/status', { method: 'POST', body: { state: st } })
        .then(function(){
          toast('Статус обновлён', 'ok');
          return sync(true);
        })
        .catch(function(err){ toast(err.message, 'alert'); });
      break;
    }
    case 'workshop-decision': {
      var wid = el.getAttribute('data-order');
      var dec = el.getAttribute('data-decision');
      var apply = function(){
        api('/api/orders/' + encodeURIComponent(wid) + '/workshop', { method: 'POST', body: { decision: dec } })
          .then(function(){
            toast(dec === 'accept' ? 'Заказ ' + wid + ' принят в цех' : 'Заказ ' + wid + ' отклонён', dec === 'accept' ? 'ok' : 'alert');
            S.dialog = null;
            return sync(true);
          })
          .catch(function(err){ toast(err.message, 'alert'); });
      };
      if (dec === 'decline') {
        S.dialog = {
          title: 'Отклонить заказ в цех?',
          text: 'Клиент и перевозчик получат уведомление, что цех не примет партию.',
          kind: 'alert',
          confirmText: 'Отклонить',
          onConfirm: apply
        };
        render();
      } else apply();
      break;
    }
    case 'cancel-order': {
      var cid = el.getAttribute('data-order');
      S.dialog = {
        title: 'Отменить заказ?',
        text: 'Перевозчик и цех получат уведомление об отмене заказа ' + cid + '.',
        kind: 'alert',
        confirmText: 'Отменить заказ',
        onConfirm: function(){
          api('/api/orders/' + encodeURIComponent(cid) + '/cancel', { method: 'POST' })
            .then(function(){
              toast('Заказ ' + cid + ' отменён', 'alert');
              S.dialog = null;
              return sync(true);
            })
            .catch(function(err){ toast(err.message, 'alert'); });
        }
      };
      render();
      break;
    }
    case 'quick-price': {
      var qid = el.getAttribute('data-order');
      var delta = parseInt(el.getAttribute('data-delta'), 10) || 0;
      var order = S.orders.filter(function(o){ return o.id === qid; })[0];
      if (!order) break;
      var text;
      if (delta === 0) {
        text = 'Фиксирую цену: ' + order.pricePer + ' ₽ за курицу, итого ' + money(order.total) + '.';
      } else {
        text = 'Предлагаю цену ' + Math.max(1, order.pricePer + delta) + ' ₽ за курицу.';
      }
      api('/api/orders/' + encodeURIComponent(qid) + '/messages', { method: 'POST', body: { text: text, priceChip: true } })
        .then(function(){ return loadMessages(qid); })
        .catch(function(err){ toast(err.message, 'alert'); });
      break;
    }
    case 'logout':
      api('/api/auth/logout', { method: 'POST' }).catch(function(){})
        .then(function(){
          S.me = null;
          S.orders = [];
          S.notifications = [];
          saveToken('');
          wiz = { step: 'contact', channel: 'sms', phone: '', email: '', code: '', devCode: '', errors: {}, busy: false, profile: { name: '', bank: '', card: '', recipient: '', address: '' } };
          renderAuth();
        });
      break;
    case 'dialog-confirm':
      if (S.dialog && S.dialog.onConfirm) S.dialog.onConfirm();
      else { S.dialog = null; render(); }
      break;
    default:
      break;
  }
}

/* ============================================================
   12. ФОРМЫ
   ============================================================ */
function fv(form, name){
  var el = form.querySelector('[name="' + name + '"]');
  return el ? String(el.value == null ? '' : el.value) : '';
}

async function sendCode(isResend){
  var channel = wiz.channel;
  var body = channel === 'sms'
    ? { channel: 'sms', phone: wiz.phone }
    : { channel: 'email', email: wiz.email };
  wiz.busy = true;
  wiz.errors = {};
  renderAuth();
  try {
    var data = await api('/api/auth/code', { method: 'POST', body: body });
    wiz.devCode = data.devCode || '';
    wiz.step = 'code';
    wiz.busy = false;
    wiz.code = '';
    renderAuth();
    toast(isResend ? 'Код отправлен повторно' : 'Код отправлен', 'live');
  } catch (err) {
    wiz.busy = false;
    wiz.errors.contact = err.message;
    renderAuth();
    toast(err.message, 'alert');
  }
}

async function handleForm(form, ev){
  ev.preventDefault();
  var kind = form.getAttribute('data-form');

  if (kind === 'wiz-contact') {
    if (wiz.channel === 'sms') {
      var d = formatPhoneInput(fv(form, 'phone'));
      if (d.length !== 11) {
        wiz.errors.contact = 'Введите номер полностью: +7 и 10 цифр';
        wiz.phone = d;
        renderAuth();
        return;
      }
      wiz.phone = d;
    } else {
      var em = fv(form, 'email').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) {
        wiz.errors.contact = 'Введите корректный e-mail';
        renderAuth();
        return;
      }
      wiz.email = em;
    }
    await sendCode(false);
    return;
  }

  if (kind === 'wiz-code') {
    var code = fv(form, 'code').replace(/\D/g, '');
    if (code.length !== 4) {
      wiz.errors.code = 'Введите 4 цифры из SMS';
      renderAuth();
      return;
    }
    wiz.code = code;
    wiz.busy = true;
    renderAuth();
    try {
      var body = {
        channel: wiz.channel,
        code: code
      };
      if (wiz.channel === 'sms') body.phone = wiz.phone;
      else body.email = wiz.email;
      var data = await api('/api/auth/verify', { method: 'POST', body: body });
      wiz.busy = false;
      saveToken(data.token || '');
      S.me = data.user;
      await afterLogin();
      toast('С возвращением, ' + S.me.name + '!', 'ok');
    } catch (err) {
      wiz.busy = false;
      if (err.status === 422 && err.data && err.data.needProfile) {
        wiz.step = 'profile';
        wiz.errors = {};
        renderAuth();
        return;
      }
      wiz.errors.code = err.message;
      renderAuth();
    }
    return;
  }

  if (kind === 'wiz-profile') {
    wiz.errors = {};
    var name = fv(form, 'name').trim();
    var bank = fv(form, 'bank').trim();
    var card = fv(form, 'card').replace(/\D/g, '');
    var recipient = fv(form, 'recipient').trim();
    var address = fv(form, 'address').trim();
    wiz.profile = { name: name, bank: bank, card: card, recipient: recipient, address: address };
    if (name.length < 2) wiz.errors.name = 'Укажите имя';
    if (!bank) wiz.errors.bank = 'Укажите банк';
    if (card.length < 8) wiz.errors.card = 'Укажите номер карты или счёта';
    if (!recipient) wiz.errors.recipient = 'Укажите получателя';
    if (!wiz.role) wiz.errors.role = 'Выберите роль';
    if (wiz.role === 'workshop' && !address) wiz.errors.address = 'Укажите адрес цеха';
    if (Object.keys(wiz.errors).some(function(k){ return wiz.errors[k]; })) {
      renderAuth();
      return;
    }
    wiz.busy = true;
    renderAuth();
    try {
      var body2 = {
        channel: wiz.channel,
        code: wiz.code,
        profile: {
          name: name, bank: bank, card: card, recipient: recipient,
          role: wiz.role, address: address
        }
      };
      if (wiz.channel === 'sms') body2.phone = wiz.phone;
      else body2.email = wiz.email;
      var data2 = await api('/api/auth/verify', { method: 'POST', body: body2 });
      wiz.busy = false;
      saveToken(data2.token || '');
      S.me = data2.user;
      await afterLogin();
      toast('Профиль создан. Добро пожаловать!', 'ok');
    } catch (err) {
      wiz.busy = false;
      wiz.errors.name = err.message;
      renderAuth();
    }
    return;
  }

  if (kind === 'new-order') {
    form.querySelectorAll('.err').forEach(function(e){ e.textContent = ''; });
    var ok = true;
    function setErr(n, msg){
      var box = form.querySelector('[data-err="' + n + '"]');
      if (box) box.textContent = msg;
      ok = false;
    }
    var qty = parseInt(fv(form, 'qty').replace(/\D/g, ''), 10);
    var price = parseInt(fv(form, 'price').replace(/\D/g, ''), 10);
    var pickup = fv(form, 'pickup').trim();
    var workshopId = fv(form, 'workshopId');
    var workshopAddress = fv(form, 'workshopAddress').trim();
    if (!qty || qty < 1) setErr('qty', 'Укажите количество куриц');
    if (!price || price < 1) setErr('price', 'Укажите цену за 1 курицу');
    if (pickup.length < 5) setErr('pickup', 'Укажите адрес получения');
    if (!workshopId && workshopAddress.length < 5) setErr('workshop', 'Выберите цех или укажите адрес чистки');
    if (!ok) return;

    try {
      var created = await api('/api/orders', {
        method: 'POST',
        body: {
          qty: qty,
          pricePer: price,
          pickup: pickup,
          pickupLat: fv(form, 'pickupLat') || null,
          pickupLng: fv(form, 'pickupLng') || null,
          workshopId: workshopId || null,
          workshopAddress: workshopAddress,
          comment: fv(form, 'comment')
        }
      });
      S.newOrderOpen = false;
      toast('Заказ ' + created.order.id + ' отправлен перевозчикам и в цех', 'ok');
      announce('Заказ создан и отправлен перевозчикам и в цех.');
      await sync(true);
    } catch (err) {
      toast(err.message, 'alert');
    }
    return;
  }

  if (kind === 'chat-send') {
    var text = fv(form, 'text').trim();
    if (!text || !S.chatOrderId) return;
    try {
      await api('/api/orders/' + encodeURIComponent(S.chatOrderId) + '/messages', {
        method: 'POST',
        body: { text: text }
      });
      await loadMessages(S.chatOrderId);
    } catch (err) {
      toast(err.message, 'alert');
    }
    return;
  }

  if (kind === 'edit-profile') {
    try {
      var data3 = await api('/api/me', {
        method: 'PUT',
        body: {
          name: fv(form, 'name'),
          bank: fv(form, 'bank'),
          card: fv(form, 'card'),
          recipient: fv(form, 'recipient'),
          email: fv(form, 'email'),
          address: fv(form, 'address'),
          role: fv(form, 'role')
        }
      });
      S.me = data3.user;
      S.editProfile = false;
      render();
      toast('Профиль обновлён', 'ok');
    } catch (err) {
      toast(err.message, 'alert');
    }
    return;
  }
}

async function afterLogin(){
  lastSyncJson = '';
  S.view = 'orders';
  render();
  try {
    await sync(true);
  } catch (err) {
    if (err && err.message !== 'Сессия истекла') {
      toast('Не удалось загрузить данные: ' + err.message, 'alert');
      render();
    }
    return;
  }
  startPolling();
}

/* ============================================================
   13. СОБЫТИЯ
   ============================================================ */
document.addEventListener('click', function(ev){
  if (!ev.target.closest) return;
  var el = ev.target.closest('[data-action]');
  if (!el) return;
  ev.preventDefault();
  handleAction(el.getAttribute('data-action'), el, ev);
});
document.addEventListener('submit', function(ev){
  var form = ev.target;
  if (form && form.getAttribute && form.getAttribute('data-form')) {
    handleForm(form, ev);
  }
});
document.addEventListener('input', function(ev){
  var t = ev.target;
  if (t.hasAttribute && t.hasAttribute('data-phone')) {
    var oldLen = t.value.length;
    var pos = t.selectionStart;
    t.value = prettyPhone(t.value);
    var diff = t.value.length - oldLen;
    try { t.setSelectionRange(pos + diff, pos + diff); } catch (e) {}
    return;
  }
  if (t.hasAttribute && t.hasAttribute('data-card')) {
    t.value = fmtCardFull(String(t.value).replace(/\D/g, '').slice(0, 16));
    return;
  }
  if (t.classList && t.classList.contains('js-calc')) recalcTotal();
});
document.addEventListener('keydown', function(ev){
  if (ev.key === 'Escape' && (S.drawerOpen || S.menuOpen || S.dialog)) {
    S.drawerOpen = false;
    S.menuOpen = false;
    S.dialog = null;
    if (S.me) render();
  }
});

/* ============================================================
   14. СТАРТ
   ============================================================ */
async function boot(){
  try {
    S.meta = await api('/api/meta');
  } catch (err) {
    renderOffline();
    return;
  }
  S.token = loadToken();
  try {
    var meData = await api('/api/me');
    S.me = meData.user;
    await afterLogin();
  } catch (err) {
    renderAuth();
  }
}
boot();

})();
</script>
</body>
</html>
