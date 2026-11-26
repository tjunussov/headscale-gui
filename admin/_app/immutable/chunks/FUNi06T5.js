function r(a,t){try{return{...t,...JSON.parse(localStorage.getItem("ui:"+a)??"{}")}}catch{return t}}function e(a,t){try{localStorage.setItem("ui:"+a,JSON.stringify(t))}catch{}}export{e as a,r as u};
