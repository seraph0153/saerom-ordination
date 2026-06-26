/* ----------------------------------------------------
 * Saerom Church Ordination Landing Page JavaScript
 * Premium Interactive Features
 * ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Global Utilities & Configurations ---
  const TARGET_DATE = new Date('2026-07-05T14:00:00+09:00').getTime(); // KST (Korean Standard Time)
  
  // Custom Toast Notification
  function showToast(message, iconClass = 'fa-solid fa-check') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    // Auto remove after animation finishes (3 seconds total)
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Active Navigation link highlighting on scroll
  const sections = document.querySelectorAll('section, header');
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
    
    // Add box-shadow/small design change on scroll for header nav
    const floatingNav = document.getElementById('floatingNav');
    if (window.scrollY > 50) {
      floatingNav.classList.add('scrolled');
    } else {
      floatingNav.classList.remove('scrolled');
    }
  });

  // --- 2. Countdown Timer ---
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = TARGET_DATE - now;

    const daysVal = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hoursVal = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesVal = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secondsVal = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');
    const msgEl = document.getElementById('countdownMessage');

    if (distance < 0) {
      clearInterval(countdownInterval);
      dEl.innerText = '00';
      hEl.innerText = '00';
      mEl.innerText = '00';
      sEl.innerText = '00';
      msgEl.innerText = '새롬교회 임직감사예배가 은혜 가운데 시작되었습니다.';
      return;
    }

    // Format with leading zero
    dEl.innerText = daysVal.toString().padStart(2, '0');
    hEl.innerText = hoursVal.toString().padStart(2, '0');
    mEl.innerText = minutesVal.toString().padStart(2, '0');
    sEl.innerText = secondsVal.toString().padStart(2, '0');
    
    msgEl.innerText = `임직식까지 ${daysVal}일 ${hoursVal}시간 남았습니다. 기도로 동참해 주세요.`;
  }
  
  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);

  // --- 3. Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- 4. Interactive Officers Carousel Controller ---
  const sliderTrackEl = document.getElementById('officerSliderTrack');
  const slides = document.querySelectorAll('.officer-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('prevOfficerBtn');
  const nextBtn = document.getElementById('nextOfficerBtn');
  let currentSlideIndex = 0;

  function showSlide(index) {
    // Handle wrap-around
    if (index < 0) {
      index = slides.length - 1;
    } else if (index >= slides.length) {
      index = 0;
    }

    // Slide horizontal transition
    if (sliderTrackEl) {
      sliderTrackEl.style.transform = `translateX(-${index * 100}%)`;
    }

    // Reset all cards back to front on slide change
    document.querySelectorAll('.slide-card-inner').forEach(card => {
      card.classList.remove('flipped');
    });

    // Deactivate current slide and dot
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Activate selected slide and dot
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentSlideIndex = index;
  }

  // Click listeners for card flipping
  document.querySelectorAll('.slide-card-front').forEach(frontCard => {
    frontCard.addEventListener('click', () => {
      const innerCard = frontCard.closest('.slide-card-inner');
      if (innerCard) {
        innerCard.classList.add('flipped');
      }
    });
  });

  document.querySelectorAll('.btn-flip-back').forEach(backBtn => {
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering flip events on parent card
      const innerCard = backBtn.closest('.slide-card-inner');
      if (innerCard) {
        innerCard.classList.remove('flipped');
      }
    });
  });

  // Click listeners for arrows
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlideIndex - 1);
    });
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlideIndex + 1);
    });
  }

  // Click listeners for dots
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
    });
  });

  // Swipe support for mobile devices
  const sliderTrack = document.querySelector('.officers-slider');
  if (sliderTrack) {
    let touchStartX = 0;
    let touchEndX = 0;

    sliderTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeDistance = touchStartX - touchEndX;
      const threshold = 50; // min distance for swipe
      
      if (swipeDistance > threshold) {
        // Swipe left -> Next slide
        showSlide(currentSlideIndex + 1);
      } else if (swipeDistance < -threshold) {
        // Swipe right -> Previous slide
        showSlide(currentSlideIndex - 1);
      }
    }
  }





  // --- 6. Address Clipboard Copy ---
  document.getElementById('copyAddressBtn').addEventListener('click', () => {
    const address = '경기도 군포시 군포로 476번길 16';
    navigator.clipboard.writeText(address).then(() => {
      showToast('새롬교회 주소가 복사되었습니다.', 'fa-regular fa-clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // Fallback
      const el = document.createElement('textarea');
      el.value = address;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast('새롬교회 주소가 복사되었습니다.', 'fa-regular fa-clipboard');
    });
  });

  // --- 7. Add to Calendar (Google / Apple / Outlook) ---
  
  // Google Calendar Link
  document.getElementById('googleCalendarBtn').addEventListener('click', () => {
    const title = encodeURIComponent('새롬교회 임직감사예배');
    const start = '20260705T140000';
    const end = '20260705T160000';
    const loc = encodeURIComponent('경기도 군포시 군포로 476번길 16 새롬교회 2층 본당');
    const details = encodeURIComponent('날마다 더 새로워지는 새롬교회 임직감사예배에 초대합니다.\n임직자: 안수집사 안민희, 권사 이경희, 김태연, 조영아');
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${loc}`;
    window.open(googleUrl, '_blank');
    showToast('구글 캘린더 등록 페이지로 이동합니다.', 'fa-solid fa-calendar-check');
  });

  // ICS File Generation for Apple / Outlook
  document.getElementById('icsCalendarBtn').addEventListener('click', () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Saerom Church//Ordination Invitation//KO',
      'BEGIN:VEVENT',
      'UID:saerom-church-ordination-20260705',
      'DTSTAMP:20260626T000000Z',
      'DTSTART;TZID=Asia/Seoul:20260705T140000',
      'DTEND;TZID=Asia/Seoul:20260705T160000',
      'SUMMARY:새롬교회 임직감사예배',
      'DESCRIPTION:날마다 더 새로워지는 새롬교회 임직감사예배 초청장\\n\\n임직자:\\n- 안수집사: 안민희\\n- 권사: 이경희\\, 김태연\\, 조영아',
      'LOCATION:경기도 군포시 군포로 476번길 16 새롬교회 2층 본당',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', '새롬교회_임직감사예배.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('캘린더 파일(.ics)이 다운로드되었습니다.', 'fa-regular fa-file-invoice');
  });



  // --- 9. Sharing Options & Native Web Share API ---
  const pageUrl = window.location.href;
  const shareTitle = '새롬교회 임직감사예배 초청장';
  const shareText = '새롬교회 그리스도의 일꾼 세움식(임직감사예배)에 소중한 당신을 초대합니다.';

  // Show Web Share API button if supported (iOS/Android browsers)
  const webShareBtn = document.getElementById('webShareBtn');
  if (navigator.share) {
    webShareBtn.style.display = 'inline-flex';
    webShareBtn.addEventListener('click', () => {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: pageUrl
      }).catch(err => console.log('Share failed:', err));
    });
  }

  // Copy Link Clipboard
  document.getElementById('copyLinkBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      showToast('초청장 링크 주소가 복사되었습니다.', 'fa-solid fa-link');
    }).catch(err => {
      // Fallback
      const el = document.createElement('textarea');
      el.value = pageUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast('초청장 링크 주소가 복사되었습니다.', 'fa-solid fa-link');
    });
  });

  // KakaoTalk Link Sharing (Official Web Sharing SDK Mock + Template description)
  // To use real KakaoLink, the user just needs to register their JavaScript Key on Kakao Developers Console
  document.getElementById('kakaoShareBtn').addEventListener('click', () => {
    if (typeof Kakao !== 'undefined') {
      // If Kakao SDK is loaded and initialized, run it:
      try {
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '새롬교회 임직감사예배',
            description: '그리스도의 일꾼으로 한걸음 나아가는 은혜의 자리에 정중히 초대합니다.',
            imageUrl: pageUrl + 'assets/invitation_card.jpg',
            link: {
              mobileWebUrl: pageUrl,
              webUrl: pageUrl,
            },
          },
          buttons: [
            {
              title: '초청장 보기',
              link: {
                mobileWebUrl: pageUrl,
                webUrl: pageUrl,
              },
            },
          ],
        });
        showToast('카카오톡 공유가 실행되었습니다.', 'fa-solid fa-share');
      } catch (e) {
        // Fallback: Copy link
        copyLinkFallback();
      }
    } else {
      // Fallback
      copyLinkFallback();
    }
  });

  function copyLinkFallback() {
    navigator.clipboard.writeText(pageUrl).then(() => {
      showToast('카카오톡 SDK 연동 대기중. 초청장 주소가 복사되었습니다.', 'fa-solid fa-link');
    });
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return 'pass_' + Math.abs(hash).toString(36);
  }

  // --- 9. Admin Mode Password Prompt & Editor Loader ---
  const adminBtn = document.getElementById('adminEditTrigger');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      // If editor script is already loaded, just toggle the panel
      if (window.SaeromVisualEditor) {
        window.SaeromVisualEditor.togglePanel();
        return;
      }
      
      const correctHash = adminBtn.getAttribute('data-auth') || adminBtn.getAttribute('data-password') || 'pass_vp0f'; // 'pass_vp0f' is hash of '0153'
      const inputPass = prompt('관리자 비밀번호를 입력해 주세요:');
      if (inputPass === null) return; // Cancel
      
      const inputHash = simpleHash(inputPass);
      const adminHash = 'pass_1j67nz'; // 'pass_1j67nz' is hash of 'admin'
      
      if (inputHash === correctHash || inputHash === adminHash) {
        showToast('관리자 인증 성공! 편집 모드를 로드합니다.', 'fa-solid fa-user-shield');
        
        // Dynamically load editor.js
        const editorScript = document.createElement('script');
        editorScript.src = 'js/editor.js';
        editorScript.onload = () => {
          if (window.SaeromVisualEditor) {
            window.SaeromVisualEditor.init();
          }
        };
        editorScript.onerror = () => {
          showToast('편집기 로드에 실패했습니다. js/editor.js 파일을 확인하세요.', 'fa-solid fa-circle-exclamation');
        };
        document.body.appendChild(editorScript);
      } else {
        showToast('비밀번호가 올바르지 않습니다.', 'fa-solid fa-lock');
      }
    });
  }
});
