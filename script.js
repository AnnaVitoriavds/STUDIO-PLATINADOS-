const toggle = document.getElementById('menuToggle');
const links = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.classList.toggle('active', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});

links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
}));

const sections = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -25px 0px' });
  sections.forEach(section => observer.observe(section));
} else {
  sections.forEach(section => section.classList.add('visible'));
}

document.getElementById('year').textContent = new Date().getFullYear();


// Efeito de profundidade 3D suave nos botões e cartões.
// Ativado apenas quando o dispositivo utiliza mouse e o usuário
// não solicitou redução de movimento.
const canAnimate3D = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canAnimate3D) {
  document.querySelectorAll('.button-3d').forEach(button => {
    button.addEventListener('pointermove', event => {
      const r = button.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5;
      const y = (event.clientY - r.top) / r.height - .5;
      button.style.transform = `translateY(-4px) rotateX(${-y * 9}deg) rotateY(${x * 12}deg)`;
    });
    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
    button.addEventListener('blur', () => { button.style.transform = ''; });
  });

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const r = card.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5;
      const y = (event.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(1100px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => {card.style.transform = '';});
  });
}

// Fecha o menu ao pressionar Esc, útil no teclado.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && links.classList.contains('open')) {
    links.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    toggle.focus();
  }
});

// Formulário de interesse: prepara uma mensagem no WhatsApp, sem armazenar dados.
const bookingForm = document.getElementById('bookingForm');
const serviceSelect = document.getElementById('service');
const preferredDate = document.getElementById('preferredDate');
const clientPhone = document.getElementById('clientPhone');
const formError = document.getElementById('formError');
const localToday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
preferredDate.min = localToday();

clientPhone.addEventListener('input', () => {
  let digits = clientPhone.value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 2) digits = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length > 10) digits = digits.replace(/(\) \d{4,5})(\d{4})$/, '$1-$2');
  clientPhone.value = digits;
});

document.querySelectorAll('[data-service]').forEach(link => {
  link.addEventListener('click', () => {
    serviceSelect.value = link.dataset.service;
  });
});

bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  formError.textContent = '';
  const name = document.getElementById('clientName').value.trim();
  const phone = clientPhone.value.replace(/\D/g, '');
  const service = serviceSelect.value;
  const date = preferredDate.value;
  const time = document.getElementById('preferredTime').value;
  const notes = document.getElementById('message').value.trim();
  const consent = document.getElementById('consent').checked;
  const isRealDate = /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(new Date(`${date}T12:00:00`).getTime());

  if (name.length < 2 || ![10,11].includes(phone.length) || !service ||
      !isRealDate || date < localToday() || !time || !consent) {
    formError.textContent = 'Confira seu nome, WhatsApp com DDD, serviço, data, horário e consentimento antes de continuar.';
    bookingForm.querySelector(':invalid')?.focus();
    return;
  }

  const [year,month,day] = date.split('-');
  const message = [
    'Olá, Studio Platinados! ✨',
    'Tenho interesse em agendar um atendimento.',
    '',
    `*Nome:* ${name}`,
    `*WhatsApp:* ${clientPhone.value}`,
    `*Serviço:* ${service}`,
    `*Data de preferência:* ${day}/${month}/${year}`,
    `*Horário de preferência:* ${time}`,
    ...(notes ? [`*Observações:* ${notes}`] : []),
    '',
    'Poderiam confirmar a disponibilidade e me informar os valores? Obrigada!'
  ].join('\n');
  const url = `https://wa.me/5561995464126?text=${encodeURIComponent(message)}`;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = url;
});
