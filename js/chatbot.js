// ============================================================
// chatbot.js — Widget de chat / asistente virtual (independiente del resto)
// ============================================================

/* ══════════════════════════════════════════════════════
   CHAT WIDGET JS — StackHire Assistant
══════════════════════════════════════════════════════ */
(function () {
  const fab = document.getElementById("chat-fab");
  const widget = document.getElementById("chat-widget");
  const msgs = document.getElementById("cw-messages");
  const input = document.getElementById("cw-input");
  const sendBtn = document.getElementById("cw-send");
  const restartB = document.getElementById("cw-restart");
  const typing = document.getElementById("cw-typing");
  const unreadBadge = document.getElementById("chat-unread");

  let isOpen = false;
  let cwState = { flow: null, step: 0, sel: {} };
  let hasGreeted = false;

  // ── FAB toggle ──
  fab.addEventListener("click", () => {
    isOpen = !isOpen;
    fab.classList.toggle("open", isOpen);
    widget.classList.toggle("chat-open", isOpen);
    widget.classList.toggle("chat-closed", !isOpen);
    unreadBadge.classList.add("hidden");
    if (isOpen && !hasGreeted) {
      hasGreeted = true;
      setTimeout(cwGreet, 350);
    }
    if (isOpen) setTimeout(() => input.focus(), 300);
  });

  // ── Helpers ──
  function cwNow() {
    return new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  function cwScroll() {
    msgs.scrollTop = msgs.scrollHeight;
  }
  function cwEsc(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── Render message ──
  function cwMsg(who, html) {
    const wrap = document.createElement("div");
    wrap.className = "cw-msg " + who;
    const bub = document.createElement("div");
    bub.className = "cw-bubble";
    if (typeof html === "string") bub.innerHTML = html;
    else bub.appendChild(html);
    wrap.appendChild(bub);
    const ts = document.createElement("span");
    ts.className = "cw-msg-time";
    ts.textContent = cwNow();
    wrap.appendChild(ts);
    msgs.appendChild(wrap);
    cwScroll();
  }

  // ── Render chips ──
  function cwChips(options, onSelect) {
    const prev = msgs.querySelector(".cw-chips");
    if (prev) prev.remove();
    const row = document.createElement("div");
    row.className = "cw-chips";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "cw-chip";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        row.remove();
        onSelect(opt);
      });
      row.appendChild(btn);
    });
    msgs.appendChild(row);
    cwScroll();
  }

  // ── Typing ──
  function cwShowTyping() {
    typing.classList.remove("hidden");
    cwScroll();
  }
  function cwHideTyping() {
    typing.classList.add("hidden");
  }
  function cwReply(fn, ms = 950) {
    cwShowTyping();
    setTimeout(() => {
      cwHideTyping();
      fn();
    }, ms);
  }

  // ── Greet ──
  function cwGreet() {
    cwMsg(
      "bot",
      `👋 <strong>¡Hola! Soy el asistente de StackHire.</strong><br><br>Puedo ayudarte a:<br><ul><li>Buscar ofertas laborales</li><li>Prepararte para entrevistas</li><li>Mejorar tu CV</li><li>Ver empleos remotos</li></ul><br>¿En qué te puedo ayudar hoy?`,
    );
    cwChips(
      [
        "🔍 Buscar empleo",
        "💼 Ver empleos remotos",
        "📄 Tips para CV",
        "🎤 Preparar entrevista",
        "🛟 Soporte",
      ],
      cwMainMenu,
    );
  }

  // ── Main menu ──
  function cwMainMenu(opt) {
    const lbl = opt.replace(/^[\p{Emoji}\s]+/u, "").trim();
    cwMsg("user", cwEsc(opt));
    if (/buscar empleo/i.test(lbl)) cwStartSearch();
    else if (/remotos?/i.test(lbl)) cwRemoteJobs();
    else if (/cv|curriculum/i.test(lbl)) cwCVTips();
    else if (/entrevista/i.test(lbl)) cwInterviewTips();
    else if (/soporte/i.test(lbl)) cwSupport();
    else cwKeyword(lbl);
  }

  // ── FLOW: Buscar empleo ──
  const JOB_TYPES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack",
    "Data Analyst",
    "DevOps / SRE",
    "UX/UI Designer",
    "Product Manager",
    "QA Automation",
  ];
  const MODALITIES = ["Remota", "Híbrida", "Presencial"];

  function cwStartSearch() {
    cwState = { flow: "search", step: 1, sel: {} };
    cwReply(() => {
      cwMsg("bot", "¿Qué tipo de puesto buscás?");
      cwChips(JOB_TYPES, (opt) => {
        cwMsg("user", cwEsc(opt));
        cwState.sel.jobType = opt;
        cwState.step = 2;
        cwReply(() => {
          cwMsg("bot", "¿En qué ciudad o zona?");
          cwState.flow = "search-city";
        }, 750);
      });
    });
  }

  function cwHandleCity(city) {
    cwState.sel.city = city || "toda Argentina";
    cwState.step = 3;
    cwState.flow = "search";
    cwReply(() => {
      cwMsg("bot", "¿Qué modalidad preferís?");
      cwChips(MODALITIES, (opt) => {
        cwMsg("user", cwEsc(opt));
        cwState.sel.modality = opt;
        cwState.flow = null;
        cwReply(() => cwShowResults(), 1100);
      });
    }, 750);
  }

  function cwShowResults() {
    const { jobType, city, modality } = cwState.sel;
    // Match with real JOBS data from the portal
    const matching =
      typeof JOBS !== "undefined"
        ? JOBS.filter((j) => {
            if (!isJobVisibleToCandidates(j)) return false;
            const mMatch =
              modality === "Remota"
                ? j.modalidad === "remota"
                : modality === "Híbrida"
                  ? j.modalidad === "hibrida"
                  : j.modalidad === "presencial";
            return mMatch;
          }).slice(0, 3)
        : [];

    const frag = document.createDocumentFragment();
    const intro = document.createElement("span");
    intro.innerHTML = `Encontré estas oportunidades <strong>${cwEsc(modality)}</strong> para <strong>${cwEsc(jobType)}</strong>:`;
    frag.appendChild(intro);

    if (matching.length > 0) {
      matching.forEach((j, i) => {
        const card = document.createElement("div");
        card.className = "cw-job-card";
        card.innerHTML = `<div class="cw-jt">${i + 1}. ${cwEsc(j.tituloOferta)}</div>
          <div class="cw-jm">
            <span>🏢 ${cwEsc(j.empresa)}</span>
            <span>📍 ${cwEsc(j.ciudad)}, ${cwEsc(j.provincia)}</span>
            <span>💰 $${(j.salarioMin / 1000000).toFixed(1)}M – $${(j.salarioMax / 1000000).toFixed(1)}M/mes</span>
          </div>`;
        frag.appendChild(card);
      });
    } else {
      const none = document.createElement("div");
      none.className = "cw-job-card";
      none.innerHTML = `<div class="cw-jt">Sin resultados exactos</div><div class="cw-jm"><span>Probá con otra modalidad o tipo de puesto.</span></div>`;
      frag.appendChild(none);
    }

    cwMsg("bot", frag);
    setTimeout(() => {
      cwMsg(
        "bot",
        "¿Te interesa alguna posición? Podés verla en detalle desde el buscador del portal.",
      );
      cwChips(
        ["🔍 Ir al buscador", "🔄 Nueva búsqueda", "🏠 Menú principal"],
        (opt) => {
          cwMsg("user", cwEsc(opt));
          if (/buscador/i.test(opt)) {
            triggerSearch(); // use portal's search
            fab.click(); // close chat
          } else if (/nueva/i.test(opt)) cwStartSearch();
          else cwReply(cwGreet, 400);
        },
      );
    }, 350);
  }

  // ── FLOW: Remotos ──
  function cwRemoteJobs() {
    cwReply(() => {
      const remotes =
        typeof JOBS !== "undefined"
          ? JOBS.filter((j) => isJobVisibleToCandidates(j) && j.modalidad === "remota").slice(0, 4)
          : [];
      const frag = document.createDocumentFragment();
      const lbl = document.createElement("span");
      lbl.innerHTML = "🌐 <strong>Puestos 100% remotos disponibles:</strong>";
      frag.appendChild(lbl);
      remotes.forEach((j, i) => {
        const c = document.createElement("div");
        c.className = "cw-job-card";
        c.innerHTML = `<div class="cw-jt">${i + 1}. ${cwEsc(j.tituloOferta)}</div>
          <div class="cw-jm">
            <span>🏢 ${cwEsc(j.empresa)}</span>
            <span>💰 $${(j.salarioMin / 1000000).toFixed(1)}M – $${(j.salarioMax / 1000000).toFixed(1)}M/mes</span>
          </div>`;
        frag.appendChild(c);
      });
      cwMsg("bot", frag);
      cwChips(["🔍 Ver todos en el portal", "🏠 Menú principal"], (opt) => {
        cwMsg("user", cwEsc(opt));
        if (/portal/i.test(opt)) {
          state.query = ""; // show all
          document.getElementById("results-search").value = "";
          state.modalidad = new Set(["remota"]);
          buildFilters();
          // check the remota checkbox
          const cb = document.getElementById("f-modalidad-remota");
          if (cb) cb.checked = true;
          renderJobs();
          showResults();
          fab.click();
        } else cwReply(cwGreet, 400);
      });
    });
  }

  // ── FLOW: CV Tips ──
  function cwCVTips() {
    cwReply(() => {
      cwMsg(
        "bot",
        `Para un CV que destaque:<br><br>
        ✔ <strong>Experiencia</strong> con logros cuantificados<br>
        ✔ <strong>Habilidades técnicas</strong> relevantes al puesto<br>
        ✔ <strong>Foto profesional</strong> (opcional según empresa)<br>
        ✔ <strong>1-2 páginas</strong> máximo, sin relleno<br>
        ✔ <strong>Formato PDF</strong> para envíos digitales`,
      );
      cwChips(
        ["✏️ Tips de redacción", "🎨 Diseño del CV", "🏠 Menú principal"],
        (opt) => {
          cwMsg("user", cwEsc(opt));
          if (/redacción/i.test(opt)) {
            cwReply(() => {
              cwMsg(
                "bot",
                `<strong>Redacción efectiva:</strong><br><br>
              • Usá verbos de acción: <em>lideré, desarrollé, implementé</em>.<br>
              • Cuantificá logros: <em>"Reduje bugs en 40%"</em>.<br>
              • Adaptá el CV a cada oferta.<br>
              • Evitá objetivos genéricos — mostrá valor concreto.`,
              );
              cwBackToMenu();
            });
          } else if (/diseño/i.test(opt)) {
            cwReply(() => {
              cwMsg(
                "bot",
                `<strong>Diseño que entra por los ojos:</strong><br><br>
              • Tipografía legible, cuerpo 10-11pt.<br>
              • Márgenes amplios, sin texto apretado.<br>
              • Una paleta de 1-2 colores máximo.<br>
              • Herramientas: Canva, Figma, Enhancv.`,
              );
              cwBackToMenu();
            });
          } else cwReply(cwGreet, 400);
        },
      );
    });
  }

  // ── FLOW: Entrevista ──
  function cwInterviewTips() {
    cwReply(() => {
      cwMsg(
        "bot",
        `<strong>Preguntas más comunes:</strong><br><br>
        • Contame de vos ¿quién sos?<br>
        • ¿Cuáles son tus fortalezas y debilidades?<br>
        • ¿Por qué querés trabajar acá?<br>
        • Describí un desafío técnico que resolviste.<br>
        • ¿Dónde te ves en 3 años?<br><br>
        💡 <em>Usá el método STAR para respuestas de comportamiento.</em>`,
      );
      cwChips(
        ["⭐ Método STAR", "👔 Qué vestir", "🏠 Menú principal"],
        (opt) => {
          cwMsg("user", cwEsc(opt));
          if (/star/i.test(opt)) {
            cwReply(() => {
              cwMsg(
                "bot",
                `<strong>Método STAR:</strong><br><br>
              <strong>S</strong>ituación – el contexto.<br>
              <strong>T</strong>area – tu responsabilidad.<br>
              <strong>A</strong>cción – lo que hiciste.<br>
              <strong>R</strong>esultado – el impacto medible.<br><br>
              Ej: <em>"Optimicé el pipeline de CI, reduciendo el tiempo de deploy de 40 min a 8 min."</em>`,
              );
              cwBackToMenu();
            });
          } else if (/vestir/i.test(opt)) {
            cwReply(() => {
              cwMsg(
                "bot",
                `<strong>Cómo presentarse:</strong><br><br>
              • <strong>Presencial:</strong> business casual o formal según la empresa.<br>
              • <strong>Remota:</strong> parte superior prolija, fondo neutro, buena luz.<br>
              • Investigá la cultura de la empresa antes.`,
              );
              cwBackToMenu();
            });
          } else cwReply(cwGreet, 400);
        },
      );
    });
  }

  // ── FLOW: Soporte ──
  function cwSupport() {
    cwReply(() => {
      cwMsg("bot", "🛟 <strong>¿Con qué necesitás ayuda?</strong>");
      cwChips(
        [
          "🔑 Iniciar sesión",
          "👤 Actualizar perfil",
          "📋 Mis postulaciones",
          "❓ Otra consulta",
        ],
        (opt) => {
          cwMsg("user", cwEsc(opt));
          const resp = {
            "iniciar sesión":
              'Verificá tu email y contraseña. Si persiste, usá <strong>"Olvidé mi contraseña"</strong> en el login para recibir un link de recuperación.',
            "actualizar perfil":
              "Ve a <strong>Mi Perfil → Editar</strong> para actualizar datos, foto, habilidades y experiencia. Los cambios se guardan automáticamente.",
            "mis postulaciones":
              "En <strong>Mi Cuenta → Postulaciones</strong> podés ver el estado de cada aplicación: Enviada, En revisión, Entrevista programada o Cerrada.",
            "otra consulta":
              "¿Podés contarme más sobre tu consulta? Escribila y hago lo posible por ayudarte.",
          };
          const key = Object.keys(resp).find((k) =>
            opt.toLowerCase().includes(k),
          );
          cwReply(() => {
            cwMsg(
              "bot",
              resp[key] ||
                "Nuestro soporte está disponible de lunes a viernes de 9 a 18 hs. ¿Te puedo ayudar en algo más?",
            );
            cwBackToMenu();
          });
        },
      );
    });
  }

  // ── Back to menu ──
  function cwBackToMenu() {
    cwChips(["🏠 Menú principal", "🔍 Buscar empleo"], (opt) => {
      cwMsg("user", cwEsc(opt));
      if (/menú/i.test(opt)) cwReply(cwGreet, 400);
      else cwStartSearch();
    });
  }

  // ── Keyword fallback ──
  const CW_KEYWORDS = [
    {
      re: /cv|curriculum/i,
      reply: "Puedo darte tips para mejorar tu CV y destacarte. 📄",
    },
    {
      re: /entrevista/i,
      reply:
        "La preparación es clave. Practicá preguntas frecuentes y usá el método STAR. 🎤",
    },
    {
      re: /salario|sueldo/i,
      reply:
        "Los salarios en tech varían mucho según rol y experiencia. Mirá los rangos en las cards del portal. 💰",
    },
    {
      re: /remoto|remote/i,
      reply:
        "¡Hay muchas posiciones remotas disponibles! ¿Querés que te las muestre? 🌐",
    },
    { re: /hola|buenas|hi/i, reply: "¡Hola! 👋 ¿En qué puedo ayudarte hoy?" },
    { re: /gracias|thanks/i, reply: "¡De nada! Siempre estoy por acá. 😊" },
    {
      re: /chau|bye|adiós/i,
      reply: "¡Hasta pronto! Mucho éxito en tu búsqueda laboral. 🚀",
    },
  ];

  function cwKeyword(text) {
    const match = CW_KEYWORDS.find((k) => k.re.test(text));
    if (match)
      cwReply(() => {
        cwMsg("bot", match.reply);
        cwBackToMenu();
      });
    else
      cwReply(() => {
        cwMsg(
          "bot",
          "No estoy seguro cómo ayudarte con eso. Podés elegir una opción o escribir palabras como <em>empleo</em>, <em>CV</em> o <em>entrevista</em>.",
        );
        cwChips(
          ["🔍 Buscar empleo", "📄 CV", "🎤 Entrevista", "🏠 Menú principal"],
          cwMainMenu,
        );
      });
  }

  // ── Handle user text ──
  function cwHandleInput() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    const chips = msgs.querySelector(".cw-chips");
    if (chips) chips.remove();
    cwMsg("user", cwEsc(text));
    if (cwState.flow === "search-city") {
      cwHandleCity(text);
      return;
    }
    cwKeyword(text);
  }

  sendBtn.addEventListener("click", cwHandleInput);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      cwHandleInput();
    }
  });

  // ── Restart ──
  restartB.addEventListener("click", () => {
    if (!confirm("¿Reiniciar la conversación?")) return;
    msgs.innerHTML = "";
    cwState = { flow: null, step: 0, sel: {} };
    cwHideTyping();
    setTimeout(cwGreet, 200);
  });

  // ── Show unread badge after 3s if not opened ──
  setTimeout(() => {
    if (!isOpen) {
      unreadBadge.classList.remove("hidden");
      unreadBadge.textContent = "1";
    }
  }, 3000);
})();
