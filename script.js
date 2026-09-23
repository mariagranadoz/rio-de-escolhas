/*
    * Rio de Escolhas — JavaScript sem dependências.
    * Adaptação educativa da ética aristotélica, não um teste validado.
    * As respostas permanecem no navegador. Nenhuma requisição de rede é feita.
    */
    (() => {
      'use strict';
      const STORAGE_KEY = 'rio-de-escolhas:v1';
      const TOTAL = 6;
      const COLORS = Object.freeze({
        blue: { hex: '#0000ff', name: 'Azul', label: 'Maior aproximação' },
        yellow: { hex: '#ffff00', name: 'Amarelo', label: 'Aproximação parcial' },
        red: { hex: '#ff0000', name: 'Vermelho', label: 'Menor aproximação' }
      });
      /** @type {{id:string,theme:string,icon:string,question:string,options:{text:string,points:number}[],explanation:string,practice:string}[]} */
      const QUESTIONS = [
        {
          id:'prudencia', theme:'Prudência', icon:'compass',
          question:'Antes de uma decisão importante, você…',
          options:[
            {text:'Pensa nas consequências antes de agir.',points:2},
            {text:'Decide na hora e pensa depois.',points:0},
            {text:'Pensa um pouco, mas o impulso pesa.',points:1}
          ],
          explanation:'Deliberar sobre o que está ao nosso alcance ajuda a escolher os meios adequados para agir. Nesta adaptação, pensar nas consequências aproxima a resposta da prudência.',
          practice:'Antes de uma decisão hoje, pense em uma consequência para você e uma para outra pessoa.'
        },
        {
          id:'equilibrio', theme:'Equilíbrio', icon:'scale',
          question:'Como você lida com os prazeres do dia a dia?',
          options:[
            {text:'Às vezes exagera, mas tenta ajustar.',points:1},
            {text:'Procura aproveitar sem excessos.',points:2},
            {text:'Segue a vontade, mesmo quando se prejudica.',points:0}
          ],
          explanation:'A temperança envolve uma relação adequada com certos prazeres. Aqui, a ideia é adaptada ao cotidiano: aproveitar com medida, sem confundir equilíbrio com abandonar todo prazer.',
          practice:'Escolha algo de que você gosta e aproveite hoje com um limite consciente, sem abrir mão do prazer.'
        },
        {
          id:'coragem', theme:'Coragem', icon:'mountain',
          question:'Diante de algo difícil, mas importante, você…',
          options:[
            {text:'Evita enfrentar a situação.',points:0},
            {text:'Avalia os riscos e enfrenta com cuidado.',points:2},
            {text:'Tenta, mas nem sempre segue em frente.',points:1}
          ],
          explanation:'A coragem não se confunde com agir sem medo nem com se arriscar sem pensar. Esta pergunta adapta ao cotidiano a ideia de enfrentar o que é necessário, com avaliação da situação.',
          practice:'Dê um pequeno passo em uma tarefa importante que você vem evitando, respeitando seus limites e a segurança.'
        },
        {
          id:'habitos', theme:'Hábitos', icon:'repeat',
          question:'Quando quer se tornar melhor em algo, você…',
          options:[
            {text:'Pratica com constância, mesmo aos poucos.',points:2},
            {text:'Começa, mas tem dificuldade em manter.',points:1},
            {text:'Espera ter vontade para começar.',points:0}
          ],
          explanation:'A virtude do caráter se desenvolve com a prática e os hábitos. Não basta conhecer uma boa atitude: é preciso exercitá-la de forma consciente e cada vez mais constante.',
          practice:'Reserve cinco minutos para praticar um hábito que você gostaria de cultivar. Um começo possível já conta.'
        },
        {
          id:'amizade', theme:'Amizade', icon:'heart',
          question:'O que mais importa nas suas amizades?',
          options:[
            {text:'Companhia e diversão, principalmente.',points:1},
            {text:'As vantagens que pode conseguir.',points:0},
            {text:'Cuidado mútuo e querer o bem do outro.',points:2}
          ],
          explanation:'Aristóteles distingue amizades ligadas à utilidade, ao prazer e ao caráter. Na amizade mais completa, cada pessoa deseja o bem da outra por quem ela é, não apenas pelas vantagens recebidas.',
          practice:'Procure alguém de quem você gosta e escute como essa pessoa está, sem precisar pedir nada em troca.'
        },
        {
          id:'justica', theme:'Justiça', icon:'scale',
          question:'Quando uma escolha afeta outras pessoas, você…',
          options:[
            {text:'Considera o próprio interesse e o dos outros.',points:2},
            {text:'Pensa nos outros só depois de decidir.',points:1},
            {text:'Busca vantagem, mesmo sendo injusto.',points:0}
          ],
          explanation:'A justiça é tratada em relação ao outro, e não apenas ao benefício individual. Nesta adaptação, considerar as pessoas afetadas aproxima a resposta de uma escolha justa.',
          practice:'Em uma decisão compartilhada hoje, pergunte a uma pessoa afetada o que seria justo para ela também.'
        }
      ];
      const RESULTS = {
        blue:{title:'Um caminho de equilíbrio.',text:'Suas respostas se aproximam das ideias de prudência, bons hábitos e cuidado com os outros exploradas nesta jornada. Continue transformando intenção em prática.'},
        yellow:{title:'Um caminho em construção.',text:'Suas respostas alternam entre escolhas refletidas e decisões guiadas pelo momento. Uma pequena atitude repetida pode trazer mais constância ao seu caminho.'},
        red:{title:'Um convite a mudar a rota.',text:'Nas situações propostas, suas respostas ficaram mais distantes do ideal de virtude desta atividade. O próximo passo não é se julgar: é escolher um hábito para cultivar.'}
      };
      const $ = selector => document.querySelector(selector);
      const $$ = selector => Array.from(document.querySelectorAll(selector));
      const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
      const escapeHTML = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const panel = $('#question-panel');
      const content = $('#question-content');
      const traveler = $('#traveler');
      const trail = $('#journey-path');
      if (!panel || !content || !traveler || !trail) return;
      const trailLength = trail.getTotalLength();
      const actualStops = [{x:123,y:132},{x:140,y:231},{x:126,y:350},{x:308,y:470},{x:365,y:352},{x:537,y:165},{x:749,y:194}];
      // A nuvem segue o comprimento real da curva SVG, sem cortar as curvas.
      function closestLength(point) {
        let bestLength=0, bestDistance=Infinity;
        for(let length=0;length<=trailLength;length+=1.5){
          const p=trail.getPointAtLength(length);
          const distance=(p.x-point.x)**2+(p.y-point.y)**2;
          if(distance<bestDistance){bestDistance=distance;bestLength=length;}
        }
        return bestLength;
      }
      const stops=actualStops.map((point,index)=>index===TOTAL?trailLength:closestLength(point));
      let currentLength=0, busy=false, selected=null, animationToken=0, storageAvailable=true;
      /** @type {{version:number,answers:number[],released:boolean}} */
      let state=readSavedState();
      function readSavedState(){
        const initial={version:1,answers:[],released:false};
        try{
          const raw=window.localStorage.getItem(STORAGE_KEY);
          if(!raw)return initial;
          const saved=JSON.parse(raw);
          if(!saved || saved.version!==1 || !Array.isArray(saved.answers) || saved.answers.length>TOTAL ||
            !saved.answers.every((answer,i)=>Number.isInteger(answer)&&answer>=0&&answer<QUESTIONS[i].options.length)){
            window.localStorage.removeItem(STORAGE_KEY);return initial;
          }
          return {version:1,answers:saved.answers.slice(),released:saved.answers.length===TOTAL&&saved.released===true};
        }catch(_){storageAvailable=false;return initial;}
      }
      function persist(){try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(_){storageAvailable=false;}}
      function getScore(){return state.answers.reduce((sum,option,index)=>sum+QUESTIONS[index].options[option].points,0);}
      function colorKeyFor(points,maximum){
        if(!maximum)return null;
        // Comparações inteiras mantêm exatos os limites de 1/3 e 2/3.
        if(points*3<=maximum)return 'red';
        if(points*3<=maximum*2)return 'yellow';
        return 'blue';
      }
      function currentColorKey(){return colorKeyFor(getScore(),state.answers.length*2);}
      function answerColorKey(index){return colorKeyFor(QUESTIONS[index].options[state.answers[index]].points,2);}
      function announce(message){$('#announcer').textContent=message;}
      function setDropColor(){
        const key=currentColorKey(), fill=key?COLORS[key].hex:'#fffef8';
        $$('.drop-body, .keepsake-body').forEach(element=>element.setAttribute('fill',fill));
        $('.drop-body').setAttribute('stroke',key==='yellow'?'#51683f':key?'#fffef8':'#8fa48a');
        $('.drop-glint').setAttribute('visibility',key?'visible':'hidden');
        $('#drop-scale').setAttribute('transform',`scale(${state.answers.length ? .50 + state.answers.length * .065 : .38})`);
        const dot=$('#current-dot');
        dot.style.backgroundColor=key?COLORS[key].hex:'transparent';
        dot.classList.toggle('empty',!key);
        $('#color-name').textContent=key?`${COLORS[key].name} · ${state.released?'no rio':'em formação'}`:'Ainda na nuvem';
        if(state.answers.length===TOTAL&&!state.released)$('#color-name').textContent=`${COLORS[key].name} · pronta para cair`;
        $('#color-status').setAttribute('aria-label',key?`Cor da sua gota: ${COLORS[key].name}. ${COLORS[key].label}.`:'A gota ainda não tem uma cor definida.');
      }
      function updateJourneyUI(){
        const count=state.answers.length;
        $('#map-counter').textContent=`${count} de ${TOTAL} escolhas`;
        $('#map-note').textContent=state.released?'Toda mudança começa com uma escolha.':count===TOTAL?'O rio está logo ali. É hora do encontro.':count===0?'Uma gota começa a se formar...':`Próxima parada: ${QUESTIONS[count].theme.toLocaleLowerCase('pt-BR')}.`;
        const segments=$('#progress-segments');
        segments.setAttribute('aria-valuenow',String(count));
        segments.setAttribute('aria-valuetext',`${count} de ${TOTAL} perguntas respondidas`);
        Array.from(segments.children).forEach((segment,i)=>{
          segment.style.backgroundColor=i<count?COLORS[answerColorKey(i)].hex:'';
          segment.classList.toggle('is-current',i===count);
        });
        for(let i=0;i<TOTAL;i++){
          const station=$(`#station-${i+1}`), key=i<count?answerColorKey(i):null;
          station.classList.toggle('is-done',i<count);
          station.classList.toggle('is-current',!state.released&&i===count);
          station.querySelector('.station-disc').setAttribute('fill',key?COLORS[key].hex:'#f9faf4');
          station.querySelector('.station-number').setAttribute('fill',key&&key!=='yellow'?'#ffffff':'#4e6748');
        }
        $('#restart-button').disabled=!count||busy;
        setDropColor();
      }
      function setTrailPosition(length){
        currentLength=length;
        const p=trail.getPointAtLength(length);
        traveler.setAttribute('transform',`translate(${p.x} ${p.y})`);
        $('#completed-trail').setAttribute('stroke-dasharray',`${length} ${trailLength+1}`);
      }
      function animation(duration,onFrame){
        const token=animationToken;
        if(reduceMotion.matches){onFrame(1);return Promise.resolve();}
        return new Promise(resolve=>{
          const start=performance.now();
          function tick(now){
            if(token!==animationToken){resolve();return;}
            const t=Math.min(1,(now-start)/duration);onFrame(t);
            if(t<1)requestAnimationFrame(tick);else resolve();
          }
          requestAnimationFrame(tick);
        });
      }
      async function moveToStop(count,immediate=false){
        const from=currentLength,to=stops[count];
        if(immediate){setTrailPosition(to);return;}
        traveler.classList.add('is-moving');
        await animation(760,t=>{const eased=t<.5?4*t*t*t:1-((-2*t+2)**3)/2;setTrailPosition(from+(to-from)*eased);});
        traveler.classList.remove('is-moving');
      }
      function focusHeading(){
        const heading=$('#question-title');
        if(heading)heading.focus({preventScroll:true});
        // Em telas pequenas, uma pergunta nova não fica escondida sob o mapa fixo.
        if(window.matchMedia('(max-width: 900px)').matches){
          const mapPanel=$('.map-panel');
          const offset=getComputedStyle(mapPanel).position==='sticky'?mapPanel.getBoundingClientRect().height+20:20;
          const top=Math.max(0,window.scrollY+panel.getBoundingClientRect().top-offset);
          window.scrollTo({top,behavior:reduceMotion.matches?'auto':'smooth'});
        }
      }
      function renderQuestion(focus=false){
        const index=state.answers.length,question=QUESTIONS[index];
        panel.classList.remove('is-result','is-released');
        $('#step-caption').textContent=`PARADA ${String(index+1).padStart(2,'0')} DE 06`;
        $('#chapter-icon').innerHTML=icon(question.icon);
        content.innerHTML=`
          <div class="question-enter"><span class="question-chapter">${question.theme}</span>
            <h2 id="question-title" class="question-title" tabindex="-1">${question.question}</h2>
            <p class="question-subtitle" id="question-help">Escolha o que mais se parece com você.</p>
            <fieldset class="answers" aria-labelledby="question-title" aria-describedby="question-help">
              ${question.options.map((option,i)=>`<label class="answer">
                <input class="sr-only" type="radio" name="answer" value="${i}" ${selected===i?'checked':''}>
                <span class="answer-letter" aria-hidden="true">${String.fromCharCode(65+i)}</span>
                <span class="answer-copy">${escapeHTML(option.text)}</span>
                <span class="answer-indicator" aria-hidden="true">${icon('check')}</span></label>`).join('')}
            </fieldset></div>
          <div class="question-actions">
            <button type="button" class="primary-button" id="confirm-answer" ${selected===null?'disabled':''}>${index===TOTAL-1?'Concluir minhas escolhas':'Confirmar e seguir'} ${icon('arrow')}</button>
            <button type="button" class="back-button" id="back-button" ${index===0?'disabled':''}>${icon('back')} Rever resposta anterior</button>
          </div><p class="answer-hint">${icon('leaf')} Responda como você age, não como gostaria de agir.</p>`;
        content.querySelectorAll('input[name="answer"]').forEach(input=>input.addEventListener('change',()=>{
          if(busy)return;selected=Number(input.value);$('#confirm-answer').disabled=false;
        }));
        $('#confirm-answer').addEventListener('click',confirmAnswer);
        $('#back-button').addEventListener('click',goBack);
        updateJourneyUI();if(focus)focusHeading();
      }
      function resultDroplet(key){
        const stroke=key==='yellow'?'#587046':'#fffef8';
        return `<svg viewBox="-40 -44 80 105" aria-hidden="true"><g transform="translate(0 -1) scale(.79)"><use href="#drop-outline" fill="${COLORS[key].hex}" stroke="${stroke}" stroke-width="1.7"/><path d="M-15 10c-5 9-4 18 3 23" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g></svg>`;
      }
      function suggestedPractice(){
        let lowest=3,practice='';
        state.answers.forEach((option,index)=>{const points=QUESTIONS[index].options[option].points;if(points<lowest){lowest=points;practice=QUESTIONS[index].practice;}});
        return lowest===2?'Escolha uma boa atitude que você já pratica e repita amanhã, conscientemente. A constância também é um caminho.':practice;
      }
      function renderResult(focus=false){
        const key=currentColorKey(),result=RESULTS[key],released=state.released;
        panel.classList.add('is-result');panel.classList.toggle('is-released',released);
        $('#step-caption').textContent=released?'O ENCONTRO COM O RIO':'SEIS ESCOLHAS, UM CAMINHO';
        $('#chapter-icon').innerHTML=icon(released?'sun':'cloud');
        content.innerHTML=`<div class="result-stage question-enter">
          <h2 id="question-title" class="question-title" tabindex="-1">${released?'Sua gota encontrou o rio.':'Sua gota está pronta.'}</h2>
          <p class="result-intro">${released?'Cada escolha sua faz parte de algo maior.':'Ela carrega um pouco de cada escolha sua.'}</p>
          <div class="result-visual">${resultDroplet(key)}</div>
          <p class="result-color-line"><span class="color-dot" style="background:${COLORS[key].hex}"></span> ${COLORS[key].name} · ${COLORS[key].label}</p>
          <h3 class="result-caption">${result.title}</h3><p class="result-copy">${result.text}</p>
          ${released?`<div class="practice-box">${icon('leaf')}<div><span class="eyebrow">UM PEQUENO PASSO PARA HOJE</span><p>${suggestedPractice()}</p></div></div>`:''}
          <div class="result-actions">${released?`<button type="button" class="primary-button" id="review-button">Ver minhas escolhas ${icon('book')}</button><button type="button" class="secondary-button" id="new-journey">Fazer outra jornada ${icon('reset')}</button>`:`<button type="button" class="primary-button" id="release-button">Deixar minha gota cair ${icon('down')}</button><button type="button" class="back-button" id="back-button">${icon('back')} Rever última resposta</button>`}</div>
          <p class="result-note">Um convite à reflexão, não um julgamento sobre você.</p></div>`;
        if(released){
          $('#review-button').addEventListener('click',showReview);
          $('#new-journey').addEventListener('click',()=>openDialog($('#restart-dialog')));
        }else{
          $('#release-button').addEventListener('click',releaseDrop);
          $('#back-button').addEventListener('click',goBack);
        }
        updateJourneyUI();if(focus)focusHeading();
      }
      async function confirmAnswer(){
        if(busy||selected===null||state.answers.length>=TOTAL)return;
        const option=selected,index=state.answers.length;
        if(!QUESTIONS[index].options[option])return;
        busy=true;content.querySelectorAll('button,input').forEach(control=>{control.disabled=true;});
        $('#confirm-answer').innerHTML=`A gota segue seu caminho ${icon('arrow')}`;
        state.answers.push(option);selected=null;persist();updateJourneyUI();
        await moveToStop(state.answers.length);
        busy=false;if(state.answers.length===TOTAL)renderResult(true);else renderQuestion(true);
        announce(`${state.answers.length} de 6 escolhas confirmadas. Sua gota está ${COLORS[currentColorKey()].name.toLowerCase()}. ${state.answers.length===TOTAL?'Agora você pode deixá-la cair no rio.':`Próxima parada: ${QUESTIONS[state.answers.length].theme}.`}`);
      }
      async function goBack(){
        if(busy||state.released||!state.answers.length)return;
        busy=true;selected=state.answers.pop();state.released=false;persist();renderQuestion(false);
        content.querySelectorAll('button,input').forEach(control=>{control.disabled=true;});updateJourneyUI();
        await moveToStop(state.answers.length);
        busy=false;renderQuestion(true);
        announce(`Revendo a pergunta ${state.answers.length+1}. A resposta anterior está selecionada; confirme para seguir.`);
      }
      async function releaseDrop(){
        if(busy||state.released||state.answers.length!==TOTAL)return;
        busy=true;updateJourneyUI();
        $('#release-button').disabled=true;$('#release-button').innerHTML=`O encontro acontece… ${icon('down')}`;$('#back-button').disabled=true;
        const mapRect=$('.map-panel').getBoundingClientRect();
        if(mapRect.bottom<140||mapRect.top<-mapRect.height/2){
          $('.map-panel').scrollIntoView({behavior:reduceMotion.matches?'auto':'smooth',block:'start'});
          if(!reduceMotion.matches)await animation(350,()=>{});
        }
        const cloud=$('#traveler-cloud'),dropPosition=$('#drop-position');cloud.style.animation='none';
        const destination={x:749,y:285},p=trail.getPointAtLength(currentLength),scale=.50+TOTAL*.065;
        // A base da gota chega à superfície do rio antes do efeito de respingo.
        const finalY=destination.y-p.y-51*scale;
        await animation(900,t=>{
          cloud.style.opacity=String(Math.max(0,1-t*1.7));
          const y=-29+(finalY+29)*t*t,x=(destination.x-p.x)*t;
          dropPosition.setAttribute('transform',`translate(${x} ${y})`);
        });
        traveler.setAttribute('visibility','hidden');
        const splash=$('#splash'),particles=$('#splash-particles'),key=currentColorKey();
        splash.setAttribute('visibility','visible');
        particles.innerHTML=Array.from({length:8},(_,i)=>`<circle cx="0" cy="0" r="${i%2?2.4:3.5}" fill="${COLORS[key].hex}"/>`).join('');
        await animation(900,t=>{
          const one=$('.ring-one'),two=$('.ring-two');
          one.setAttribute('rx',String(10+52*t));one.setAttribute('ry',String(4+15*t));
          two.setAttribute('rx',String(6+35*t));two.setAttribute('ry',String(3+10*t));
          one.setAttribute('opacity',String(1-t));two.setAttribute('opacity',String(1-t*.65));
          Array.from(particles.children).forEach((particle,i)=>{
            const side=i<4?-1:1,factor=(i%4+1)/4;
            particle.setAttribute('cx',String(side*(16+30*factor)*t));
            particle.setAttribute('cy',String(-Math.sin(t*Math.PI)*(12+22*factor)));
            particle.setAttribute('visibility',t>.88?'hidden':'visible');
          });
        });
        splash.setAttribute('visibility','hidden');$('#river-keepsake').setAttribute('visibility','visible');
        state.released=true;persist();busy=false;renderResult(true);
        announce(`Sua gota ${COLORS[key].name.toLowerCase()} encontrou o rio. ${RESULTS[key].title} Você pode ver suas escolhas ou começar outra jornada.`);
      }
      function showReview(){
        if(state.answers.length!==TOTAL)return;
        $('#review-list').innerHTML=QUESTIONS.map((question,index)=>{
          const answer=question.options[state.answers[index]],key=answerColorKey(index);
          return `<article class="review-item"><div class="review-item-heading"><span>${String(index+1).padStart(2,'0')} / ${question.theme}</span><span class="review-color"><i class="color-dot" style="background:${COLORS[key].hex}"></i>${COLORS[key].name} · ${answer.points}/2</span></div><h3>${question.question}</h3><p class="review-answer">${icon('check')}${escapeHTML(answer.text)}</p><p class="review-explanation">${question.explanation}</p></article>`;
        }).join('');openDialog($('#review-dialog'));
      }
      let dialogOpener=null;
      function openDialog(dialog){
        if(dialog.open)return;
        dialogOpener=document.activeElement;dialog.showModal();document.body.style.overflow='hidden';dialog.scrollTop=0;
      }
      function closeDialog(dialog){if(dialog.open)dialog.close();}
      $$('dialog').forEach(dialog=>{
        dialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>closeDialog(dialog)));
        dialog.addEventListener('click',event=>{
          if(event.target!==dialog)return;
          const rect=dialog.getBoundingClientRect();
          if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);
        });
        dialog.addEventListener('close',()=>{
          document.body.style.overflow='';
          if(dialogOpener&&document.contains(dialogOpener))dialogOpener.focus({preventScroll:true});
        });
      });
      function restart(){
        animationToken++;closeDialog($('#restart-dialog'));
        state={version:1,answers:[],released:false};selected=null;busy=false;
        try{window.localStorage.removeItem(STORAGE_KEY);}catch(_){storageAvailable=false;}
        traveler.setAttribute('visibility','visible');
        $('#traveler-cloud').style.opacity='1';$('#traveler-cloud').style.animation='';
        $('#drop-position').setAttribute('transform','translate(0 -29)');
        $('#splash').setAttribute('visibility','hidden');$('#river-keepsake').setAttribute('visibility','hidden');
        moveToStop(0,true);renderQuestion(true);announce('Uma nova jornada começou. Primeira parada: prudência.');
      }
      $('#about-button').addEventListener('click',()=>openDialog($('#info-dialog')));
      $('#legend-button').addEventListener('click',()=>openDialog($('#info-dialog')));
      $('#restart-button').addEventListener('click',()=>{if(!busy&&state.answers.length)openDialog($('#restart-dialog'));});
      $('#confirm-restart').addEventListener('click',restart);
      if('ResizeObserver' in window){
        new ResizeObserver(entries=>document.documentElement.style.setProperty('--map-height',`${Math.ceil(entries[0].target.getBoundingClientRect().height)}px`)).observe($('.map-panel'));
      }
      moveToStop(state.answers.length,true);
      if(state.released){traveler.setAttribute('visibility','hidden');$('#river-keepsake').setAttribute('visibility','visible');}
      if(state.answers.length===TOTAL)renderResult();else renderQuestion();
      if(state.answers.length)announce('Seu progresso foi recuperado neste navegador. Continue de onde parou.');
      if(!storageAvailable)announce('Você pode fazer a jornada normalmente. Este navegador não permite salvar o progresso ao fechar a página.');
    })();
