/**
 * Saerom Church Ordination Invitation Visual Editor
 * Integrates WYSIWYG editing, CSS custom positioning controls, and GitHub API direct deployment.
 */
window.SaeromVisualEditor = (function() {
  let panelEl = null;
  let isPanelOpen = false;
  let isEditing = false;
  
  // Cache important elements
  let sloganBadge = null;
  let heroCard = null;
  let namesCard = null;
  let directionsMap = null;

  // Global state for uploaded files
  let uploadedMap = null;
  let uploadedCover = null;

  function loadLocalConfig() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'js/config.js';
      script.onload = () => resolve();
      script.onerror = () => resolve(); // Gracefully skip if file doesn't exist
      document.head.appendChild(script);
    });
  }

  async function init() {
    await loadLocalConfig();
    sloganBadge = document.querySelector('.hero-slogan-badge');
    heroCard = document.querySelector('.hero-card-container');
    namesCard = document.querySelector('.hero-officer-names');
    directionsMap = document.querySelector('.directions-card-container');

    // Create the visual editor control panel
    createPanel();
    
    // Toggle active state
    enableEditing(true);
    
    // Slide open the panel
    togglePanel(true);
    
    // Show welcome toast
    showEditorToast('시각 편집 모드가 활성화되었습니다. 텍스트를 클릭해 직접 수정하고 슬라이더로 레이아웃을 조절해 보세요!', 'fa-solid fa-wand-magic-sparkles');
  }

  function preventLinkClick(e) {
    e.preventDefault();
  }

  function enableEditing(enable) {
    isEditing = enable;
    if (enable) {
      document.body.classList.add('admin-mode-active');
      document.querySelectorAll('.editable').forEach(el => {
        el.setAttribute('contenteditable', 'true');
        const parentLink = el.closest('a');
        if (parentLink) {
          parentLink.addEventListener('click', preventLinkClick, false);
        }
      });
    } else {
      document.body.classList.remove('admin-mode-active');
      document.querySelectorAll('.editable').forEach(el => {
        el.removeAttribute('contenteditable');
        const parentLink = el.closest('a');
        if (parentLink) {
          parentLink.removeEventListener('click', preventLinkClick, false);
        }
      });
    }
  }

  function getStyleVal(el, varName, fallback) {
    if (!el) return fallback;
    const inline = el.style.getPropertyValue(varName);
    if (inline) return inline.trim();
    const comp = window.getComputedStyle(el).getPropertyValue(varName);
    if (comp) return comp.trim();
    return fallback;
  }

  function createPanel() {
    // If panel already exists, don't recreate
    if (document.getElementById('adminPanel')) return;

    panelEl = document.createElement('div');
    panelEl.id = 'adminPanel';
    panelEl.className = 'admin-panel';
    
    // Target sections
    const navEl = document.querySelector('.floating-nav');
    const introSectionEl = document.querySelector('.intro-section');
    const introCardEl = document.querySelector('.intro-card');
    const officersSectionEl = document.getElementById('officers');
    const detailsSectionEl = document.querySelector('.details-section');
    const detailsLayoutEl = document.querySelector('.details-layout');
    const guestbookSectionEl = document.querySelector('.guestbook-section');
    const guestbookLayoutEl = document.querySelector('.guestbook-layout');

    // Slogan Badge initial values
    let sloganShow = sloganBadge ? sloganBadge.style.display !== 'none' : true;
    let sloganTop = sloganBadge ? parseFloat(sloganBadge.style.top) || 2.5 : 2.5;
    let sloganLeft = sloganBadge ? parseFloat(sloganBadge.style.left) || 2.5 : 2.5;
    let sloganWidth = sloganBadge ? parseInt(sloganBadge.style.width) || 70 : 70;

    // Names Card initial values
    let namesShow = namesCard ? namesCard.style.display !== 'none' : true;
    let namesMargin = namesCard ? parseInt(namesCard.style.marginTop) || 20 : 20;
    let namesFont = namesCard ? parseFloat(namesCard.style.fontSize) || 0.95 : 0.95;
    let namesPadding = namesCard ? parseInt(namesCard.style.padding.split(' ')[0]) || 14 : 14;

    // Hero Card initial values
    let cardWidth = heroCard ? parseInt(heroCard.style.width) || 81 : 81;
    let cardMarginTop = heroCard ? parseInt(heroCard.style.marginTop) || 0 : 0;
    let cardRadius = heroCard ? parseInt(heroCard.style.borderRadius) || 0 : 0;
    let cardFit = heroCard && heroCard.querySelector('.hero-card-img') ? heroCard.querySelector('.hero-card-img').style.objectFit || 'cover' : 'cover';
    let heroBorderWidth = parseInt(getStyleVal(heroCard, '--hero-card-border-width', '0'));
    let heroBorderOpacity = parseFloat(getStyleVal(heroCard, '--hero-card-border-opacity', '0'));

    // Directions Map initial values
    let mapWidth = directionsMap ? parseInt(directionsMap.style.width) || 100 : 100;
    let mapRadius = directionsMap ? parseInt(directionsMap.style.borderRadius) || 16 : 16;
    let mapMarginTop = directionsMap ? parseInt(directionsMap.style.marginTop) || 0 : 0;

    // Check if all cards are flipped
    let allFlipped = document.querySelectorAll('.slide-card-inner.flipped').length === document.querySelectorAll('.slide-card-inner').length;
    let cardSize = 380;
    if (officersSectionEl && officersSectionEl.style.getPropertyValue('--officer-card-max-width')) {
      cardSize = parseInt(officersSectionEl.style.getPropertyValue('--officer-card-max-width')) || 380;
    } else if (document.querySelector('.slide-card-inner')) {
      cardSize = parseInt(document.querySelector('.slide-card-inner').style.maxWidth) || 380;
    }

    // New CSS Variables Reading
    const navBgOpacity = parseFloat(getStyleVal(navEl, '--nav-bg-opacity', '0.85'));
    const navBorderRadius = parseInt(getStyleVal(navEl, '--nav-border-radius', '50'));

    const introSectionPadding = parseInt(getStyleVal(introSectionEl, '--intro-section-padding', '100'));
    const introCardMaxWidth = parseInt(getStyleVal(introCardEl, '--intro-card-max-width', '800'));
    const introCardPadding = parseInt(getStyleVal(introCardEl, '--intro-card-padding', '40'));
    const introCardMarginTop = parseInt(getStyleVal(introCardEl, '--intro-card-margin-top', '0'));
    const introCardBorderWidth = parseInt(getStyleVal(introCardEl, '--intro-card-border-width', '1'));
    const introCardBorderOpacity = parseFloat(getStyleVal(introCardEl, '--intro-card-border-opacity', '0.8'));

    const officerSliderMarginTop = parseInt(getStyleVal(officersSectionEl, '--officer-slider-margin-top', '24'));
    const officerCardBorderWidth = parseInt(getStyleVal(officersSectionEl, '--officer-card-border-width', '1'));
    const officerCardBorderOpacity = parseFloat(getStyleVal(officersSectionEl, '--officer-card-border-opacity', '0.08'));
    const officerCardRadius = parseInt(getStyleVal(officersSectionEl, '--officer-card-radius', '20'));
    const officerCardPadding = parseInt(getStyleVal(officersSectionEl, '--officer-card-padding', '20'));
    const officerCardJustify = getStyleVal(officersSectionEl, '--officer-card-justify', 'flex-start');

    const detailsSectionPadding = parseInt(getStyleVal(detailsSectionEl, '--details-section-padding', '100'));
    const detailsLayoutGap = parseInt(getStyleVal(detailsLayoutEl, '--details-layout-gap', '30'));
    const detailsCardRadius = parseInt(getStyleVal(detailsSectionEl, '--details-card-radius', '16'));
    
    let countdownNumberSizeVal = getStyleVal(document.querySelector('.time-block .number'), '--countdown-number-size', '2rem');
    let countdownNumberSize = parseFloat(countdownNumberSizeVal) || 2;

    const guestbookSectionPadding = parseInt(getStyleVal(guestbookSectionEl, '--guestbook-section-padding', '100'));
    const guestbookLayoutGap = parseInt(getStyleVal(guestbookLayoutEl, '--guestbook-layout-gap', '40'));

    // Retrieve saved GitHub settings
    let savedToken = localStorage.getItem('saerom_github_token') || '';
    if (!savedToken && window.SaeromEditorConfig && window.SaeromEditorConfig.token) {
      savedToken = window.SaeromEditorConfig.token;
      localStorage.setItem('saerom_github_token', savedToken);
    }
    const savedUser = localStorage.getItem('saerom_github_user') || 'seraph0153';
    const savedRepo = localStorage.getItem('saerom_github_repo') || 'saerom-ordination';

    const correctPass = document.getElementById('adminEditTrigger')?.getAttribute('data-auth') || document.getElementById('adminEditTrigger')?.getAttribute('data-password') || '0153';

    panelEl.innerHTML = `
      <div class="admin-panel-header">
        <h3><i class="fa-solid fa-sliders"></i> 실시간 디자인 에디터</h3>
        <button class="admin-panel-close" id="adminPanelClose"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="admin-panel-body">
        
        <div class="admin-accordion">
          
          <!-- Accordion 1: 상단 네비게이션 설정 -->
          <div class="admin-accordion-item">
            <button class="admin-accordion-trigger"><i class="fa-solid fa-compass"></i> 상단 메뉴 설정</button>
            <div class="admin-accordion-content">
              <div class="admin-control-group">
                <label>배경 투명도 <span class="value-display" id="valNavBgOpacity">${navBgOpacity}</span></label>
                <input type="range" class="admin-slider" id="ctrlNavBgOpacity" min="0" max="1" step="0.05" value="${navBgOpacity}">
              </div>
              <div class="admin-control-group">
                <label>모서리 둥글기 <span class="value-display" id="valNavBorderRadius">${navBorderRadius}px</span></label>
                <input type="range" class="admin-slider" id="ctrlNavBorderRadius" min="0" max="50" value="${navBorderRadius}">
              </div>
            </div>
          </div>

          <!-- Accordion 2: 메인 화면 설정 -->
          <div class="admin-accordion-item active">
            <button class="admin-accordion-trigger"><i class="fa-solid fa-image"></i> 메인 화면 설정</button>
            <div class="admin-accordion-content">
              <div class="admin-control-group" style="margin-bottom: 12px;">
                <label>메인 이미지 교체 (내 컴퓨터에서 선택)</label>
                <input type="file" id="ctrlCoverUpload" accept="image/*" style="margin-top: 4px; font-size: 0.75rem; color: #64748B;">
              </div>
              <div class="admin-control-group">
                <label>가로 폭 (데스크톱 비율) <span class="value-display" id="valCardWidth">${cardWidth}%</span></label>
                <input type="range" class="admin-slider" id="ctrlCardWidth" min="50" max="100" value="${cardWidth}">
              </div>
              <div class="admin-control-group">
                <label>카드 상단 위치 <span class="value-display" id="valCardMarginTop">${cardMarginTop}px</span></label>
                <input type="range" class="admin-slider" id="ctrlCardMarginTop" min="-80" max="150" value="${cardMarginTop}">
              </div>
              <div class="admin-control-group">
                <label>카드 둥근 모서리 <span class="value-display" id="valCardRadius">${cardRadius}px</span></label>
                <input type="range" class="admin-slider" id="ctrlCardRadius" min="0" max="40" value="${cardRadius}">
              </div>
              <div class="admin-control-group">
                <label>이미지 맞춤 방식</label>
                <select class="admin-select" id="ctrlCardFit" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #CBD5E1; font-size: 0.85rem; color: #334155; background-color: #FFFFFF; outline: none;">
                  <option value="cover" ${cardFit === 'cover' ? 'selected' : ''}>가득 채우기 (Cover)</option>
                  <option value="contain" ${cardFit === 'contain' ? 'selected' : ''}>모두 보이기 (Contain)</option>
                </select>
              </div>
              <div class="admin-control-group">
                <label>카드 테두리 두께 <span class="value-display" id="valHeroBorderWidth">${heroBorderWidth}px</span></label>
                <input type="range" class="admin-slider" id="ctrlHeroBorderWidth" min="0" max="10" value="${heroBorderWidth}">
              </div>
              <div class="admin-control-group">
                <label>카드 테두리 투명도 <span class="value-display" id="valHeroBorderOpacity">${heroBorderOpacity}</span></label>
                <input type="range" class="admin-slider" id="ctrlHeroBorderOpacity" min="0" max="1" step="0.05" value="${heroBorderOpacity}">
              </div>
              <div class="admin-section-title" style="margin-top: 15px; margin-bottom: 8px;">슬로건 배치 설정</div>
              <div class="admin-toggle-wrapper">
                <span>슬로건 노출 여부</span>
                <label class="admin-switch">
                  <input type="checkbox" id="ctrlSloganShow" ${sloganShow ? 'checked' : ''}>
                  <span class="admin-slider-switch"></span>
                </label>
              </div>
              <div class="admin-control-group">
                <label>상단 위치 <span class="value-display" id="valSloganTop">${sloganTop}%</span></label>
                <input type="range" class="admin-slider" id="ctrlSloganTop" min="-50" max="150" step="0.5" value="${sloganTop}">
              </div>
              <div class="admin-control-group">
                <label>좌측 위치 <span class="value-display" id="valSloganLeft">${sloganLeft}%</span></label>
                <input type="range" class="admin-slider" id="ctrlSloganLeft" min="-50" max="150" step="0.5" value="${sloganLeft}">
              </div>
              <div class="admin-control-group">
                <label>배지 크기 <span class="value-display" id="valSloganWidth">${sloganWidth}px</span></label>
                <input type="range" class="admin-slider" id="ctrlSloganWidth" min="30" max="180" value="${sloganWidth}">
              </div>
              <div class="admin-section-title" style="margin-top: 15px; margin-bottom: 8px;">임직자 성함 카드 설정</div>
              <div class="admin-toggle-wrapper">
                <span>성함 카드 노출 여부</span>
                <label class="admin-switch">
                  <input type="checkbox" id="ctrlNamesShow" ${namesShow ? 'checked' : ''}>
                  <span class="admin-slider-switch"></span>
                </label>
              </div>
              <div class="admin-control-group">
                <label>상단 여백 <span class="value-display" id="valNamesMargin">${namesMargin}px</span></label>
                <input type="range" class="admin-slider" id="ctrlNamesMargin" min="0" max="80" value="${namesMargin}">
              </div>
              <div class="admin-control-group">
                <label>글자 크기 <span class="value-display" id="valNamesFont">${namesFont}rem</span></label>
                <input type="range" class="admin-slider" id="ctrlNamesFont" min="0.5" max="1.5" step="0.05" value="${namesFont}">
              </div>
              <div class="admin-control-group">
                <label>카드 패딩 <span class="value-display" id="valNamesPadding">${namesPadding}px</span></label>
                <input type="range" class="admin-slider" id="ctrlNamesPadding" min="6" max="36" value="${namesPadding}">
              </div>
            </div>
          </div>

          <!-- Accordion 3: 초청의 글 설정 -->
          <div class="admin-accordion-item">
            <button class="admin-accordion-trigger"><i class="fa-solid fa-envelope-open-text"></i> 초청의 글 설정</button>
            <div class="admin-accordion-content">
              <div class="admin-control-group">
                <label>상하 여백 <span class="value-display" id="valIntroSectionPadding">${introSectionPadding}px</span></label>
                <input type="range" class="admin-slider" id="ctrlIntroSectionPadding" min="20" max="150" value="${introSectionPadding}">
              </div>
              <div class="admin-control-group">
                <label>카드 최대 가로폭 <span class="value-display" id="valIntroCardMaxWidth">${introCardMaxWidth}px</span></label>
                <input type="range" class="admin-slider" id="ctrlIntroCardMaxWidth" min="400" max="1000" step="10" value="${introCardMaxWidth}">
              </div>
              <div class="admin-control-group">
                <label>카드 내부 패딩 <span class="value-display" id="valIntroCardPadding">${introCardPadding}px</span></label>
                <input type="range" class="admin-slider" id="ctrlIntroCardPadding" min="16" max="80" value="${introCardPadding}">
              </div>
              <div class="admin-control-group">
                <label>카드 상단 여백 <span class="value-display" id="valIntroCardMarginTop">${introCardMarginTop}px</span></label>
                <input type="range" class="admin-slider" id="ctrlIntroCardMarginTop" min="-80" max="120" value="${introCardMarginTop}">
              </div>
              <div class="admin-control-group">
                <label>카드 테두리 두께 <span class="value-display" id="valIntroCardBorderWidth">${introCardBorderWidth}px</span></label>
                <input type="range" class="admin-slider" id="ctrlIntroCardBorderWidth" min="0" max="6" value="${introCardBorderWidth}">
              </div>
              <div class="admin-control-group">
                <label>카드 테두리 투명도 <span class="value-display" id="valIntroCardBorderOpacity">${introCardBorderOpacity}</span></label>
                <input type="range" class="admin-slider" id="ctrlIntroCardBorderOpacity" min="0" max="1" step="0.05" value="${introCardBorderOpacity}">
              </div>
            </div>
          </div>

          <!-- Accordion 4: 임직자 소개 설정 -->
          <div class="admin-accordion-item">
            <button class="admin-accordion-trigger"><i class="fa-solid fa-users"></i> 임직자 소개 설정</button>
            <div class="admin-accordion-content">
              <div class="admin-toggle-wrapper">
                <span>소개글 편집 모드 (카드 뒤집기)</span>
                <label class="admin-switch">
                  <input type="checkbox" id="ctrlFlipAllCards" ${allFlipped ? 'checked' : ''}>
                  <span class="admin-slider-switch"></span>
                </label>
              </div>
              <div class="admin-control-group">
                <label>소개 카드 크기 <span class="value-display" id="valOfficerCardSize">${cardSize}px</span></label>
                <input type="range" class="admin-slider" id="ctrlOfficerCardSize" min="280" max="650" value="${cardSize}">
              </div>
              <div class="admin-control-group">
                <label>소개 카드 상단 여백 <span class="value-display" id="valOfficerSliderMarginTop">${officerSliderMarginTop}px</span></label>
                <input type="range" class="admin-slider" id="ctrlOfficerSliderMarginTop" min="-40" max="100" value="${officerSliderMarginTop}">
              </div>
              <div class="admin-control-group">
                <label>카드 모서리 둥글기 <span class="value-display" id="valOfficerCardRadius">${officerCardRadius}px</span></label>
                <input type="range" class="admin-slider" id="ctrlOfficerCardRadius" min="0" max="40" value="${officerCardRadius}">
              </div>
              <div class="admin-control-group">
                <label>카드 테두리 두께 <span class="value-display" id="valOfficerCardBorderWidth">${officerCardBorderWidth}px</span></label>
                <input type="range" class="admin-slider" id="ctrlOfficerCardBorderWidth" min="0" max="8" value="${officerCardBorderWidth}">
              </div>
              <div class="admin-control-group">
                <label>카드 테두리 투명도 <span class="value-display" id="valOfficerCardBorderOpacity">${officerCardBorderOpacity}</span></label>
                <input type="range" class="admin-slider" id="ctrlOfficerCardBorderOpacity" min="0" max="1" step="0.05" value="${officerCardBorderOpacity}">
              </div>
              <div class="admin-control-group">
                <label>소개글 내부 패딩 <span class="value-display" id="valOfficerCardPadding">${officerCardPadding}px</span></label>
                <input type="range" class="admin-slider" id="ctrlOfficerCardPadding" min="10" max="40" value="${officerCardPadding}">
              </div>
              <div class="admin-control-group">
                <label>소개글 수직 정렬 방식</label>
                <select class="admin-select" id="ctrlOfficerCardJustify" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #CBD5E1; font-size: 0.85rem; color: #334155; background-color: #FFFFFF; outline: none;">
                  <option value="flex-start" ${officerCardJustify === 'flex-start' ? 'selected' : ''}>상단 정렬</option>
                  <option value="center" ${officerCardJustify === 'center' ? 'selected' : ''}>중앙 정렬</option>
                  <option value="flex-end" ${officerCardJustify === 'flex-end' ? 'selected' : ''}>하단 정렬</option>
                  <option value="space-between" ${officerCardJustify === 'space-between' ? 'selected' : ''}>양끝 분산</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Accordion 5: 예배 안내 설정 -->
          <div class="admin-accordion-item">
            <button class="admin-accordion-trigger"><i class="fa-solid fa-calendar-days"></i> 예배 안내 설정</button>
            <div class="admin-accordion-content">
              <div class="admin-control-group">
                <label>예배 섹션 상하 여백 <span class="value-display" id="valDetailsSectionPadding">${detailsSectionPadding}px</span></label>
                <input type="range" class="admin-slider" id="ctrlDetailsSectionPadding" min="20" max="150" value="${detailsSectionPadding}">
              </div>
              <div class="admin-control-group">
                <label>카드 모서리 둥글기 <span class="value-display" id="valDetailsCardRadius">${detailsCardRadius}px</span></label>
                <input type="range" class="admin-slider" id="ctrlDetailsCardRadius" min="0" max="40" value="${detailsCardRadius}">
              </div>
              <div class="admin-control-group">
                <label>카드 배치 간격 <span class="value-display" id="valDetailsLayoutGap">${detailsLayoutGap}px</span></label>
                <input type="range" class="admin-slider" id="ctrlDetailsLayoutGap" min="10" max="60" value="${detailsLayoutGap}">
              </div>
              <div class="admin-control-group">
                <label>디데이 숫자 크기 <span class="value-display" id="valCountdownNumberSize">${countdownNumberSize}rem</span></label>
                <input type="range" class="admin-slider" id="ctrlCountdownNumberSize" min="1.2" max="3.5" step="0.1" value="${countdownNumberSize}">
              </div>
            </div>
          </div>

          <!-- Accordion 6: 오시는 길 설정 -->
          <div class="admin-accordion-item">
            <button class="admin-accordion-trigger"><i class="fa-solid fa-map-location-dot"></i> 오시는 길 설정</button>
            <div class="admin-accordion-content">
              <div class="admin-control-group" style="margin-bottom: 12px;">
                <label>약도 이미지 교체 (내 컴퓨터에서 선택)</label>
                <input type="file" id="ctrlMapUpload" accept="image/*" style="margin-top: 4px; font-size: 0.75rem; color: #64748B;">
              </div>
              <div class="admin-control-group">
                <label>약도 가로 폭 <span class="value-display" id="valMapWidth">${mapWidth}%</span></label>
                <input type="range" class="admin-slider" id="ctrlMapWidth" min="50" max="100" value="${mapWidth}">
              </div>
              <div class="admin-control-group">
                <label>둥근 모서리 <span class="value-display" id="valMapRadius">${mapRadius}px</span></label>
                <input type="range" class="admin-slider" id="ctrlMapRadius" min="0" max="40" value="${mapRadius}">
              </div>
              <div class="admin-control-group">
                <label>약도 상단 여백 <span class="value-display" id="valMapMarginTop">${mapMarginTop}px</span></label>
                <input type="range" class="admin-slider" id="ctrlMapMarginTop" min="-40" max="100" value="${mapMarginTop}">
              </div>
            </div>
          </div>

          <!-- Accordion 7: 방명록 설정 -->
          <div class="admin-accordion-item">
            <button class="admin-accordion-trigger"><i class="fa-solid fa-comments"></i> 방명록 설정</button>
            <div class="admin-accordion-content">
              <div class="admin-control-group">
                <label>방명록 상하 여백 <span class="value-display" id="valGuestbookSectionPadding">${guestbookSectionPadding}px</span></label>
                <input type="range" class="admin-slider" id="ctrlGuestbookSectionPadding" min="20" max="150" value="${guestbookSectionPadding}">
              </div>
              <div class="admin-control-group">
                <label>방명록 카드 간격 <span class="value-display" id="valGuestbookLayoutGap">${guestbookLayoutGap}px</span></label>
                <input type="range" class="admin-slider" id="ctrlGuestbookLayoutGap" min="10" max="80" value="${guestbookLayoutGap}">
              </div>
            </div>
          </div>

          <!-- Accordion 8: 관리자 및 배포 설정 -->
          <div class="admin-accordion-item">
            <button class="admin-accordion-trigger"><i class="fa-solid fa-cloud-arrow-up"></i> 배포 및 비밀번호 설정</button>
            <div class="admin-accordion-content">
              <div class="admin-control-group">
                <label>관리자 비밀번호 변경</label>
                <input type="password" id="ctrlAdminPassword" placeholder="새 비밀번호 입력 (변경 시에만 입력)" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #CBD5E1; font-size: 0.85rem; color: #334155; background-color: #FFFFFF; outline: none; box-sizing: border-box;">
              </div>
              <div class="admin-section-title" style="margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #E2E8F0;">깃허브 배포 정보</div>
              <div class="admin-github-settings">
                <input type="text" id="ghUser" placeholder="GitHub 아이디" value="${savedUser}">
                <input type="text" id="ghRepo" placeholder="저장소 이름" value="${savedRepo}">
                <input type="password" id="ghToken" placeholder="GitHub PAT 토큰" value="${savedToken}">
                <small style="color: #64748B; font-size: 0.7rem; line-height: 1.3; display: block; margin-top: 4px;">
                  ※ 입력하신 토큰 정보는 브라우저 안전 저장소(localStorage)에만 저장됩니다.
                </small>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div class="admin-panel-footer">
        <button class="admin-btn admin-btn-primary" id="btnPublish"><i class="fa-solid fa-cloud-arrow-up"></i> 깃허브 바로 배포</button>
        <button class="admin-btn admin-btn-secondary" id="btnExport"><i class="fa-solid fa-file-code"></i> HTML 파일 다운로드</button>
        <button class="admin-btn admin-btn-secondary" id="btnReset"><i class="fa-solid fa-rotate-left"></i> 임시 초기화</button>
      </div>
    `;

    document.body.appendChild(panelEl);

    // Setup event listeners for settings controls
    setupListeners();
  }

  function setupListeners() {
    // Close button
    document.getElementById('adminPanelClose').addEventListener('click', () => {
      togglePanel(false);
    });

    // Accordion Toggle Logic
    document.querySelectorAll('.admin-accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const item = trigger.closest('.admin-accordion-item');
        const isActive = item.classList.contains('active');
        
        // Close all accordion items
        document.querySelectorAll('.admin-accordion-item').forEach(i => i.classList.remove('active'));
        
        // Open the clicked one if it wasn't active
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });

    // --- Accordion 1: Navigation ---
    const ctrlNavBgOpacity = document.getElementById('ctrlNavBgOpacity');
    if (ctrlNavBgOpacity) {
      ctrlNavBgOpacity.addEventListener('input', (e) => {
        const navEl = document.querySelector('.floating-nav');
        if (navEl) navEl.style.setProperty('--nav-bg-opacity', e.target.value);
        document.getElementById('valNavBgOpacity').innerText = e.target.value;
      });
    }

    const ctrlNavBorderRadius = document.getElementById('ctrlNavBorderRadius');
    if (ctrlNavBorderRadius) {
      ctrlNavBorderRadius.addEventListener('input', (e) => {
        const navEl = document.querySelector('.floating-nav');
        if (navEl) navEl.style.setProperty('--nav-border-radius', e.target.value + 'px');
        document.getElementById('valNavBorderRadius').innerText = e.target.value + 'px';
      });
    }

    // --- Accordion 2: Hero Section & Badge/Names ---
    const ctrlSloganShow = document.getElementById('ctrlSloganShow');
    ctrlSloganShow.addEventListener('change', (e) => {
      if (sloganBadge) {
        sloganBadge.style.display = e.target.checked ? 'block' : 'none';
      }
    });

    const ctrlSloganTop = document.getElementById('ctrlSloganTop');
    ctrlSloganTop.addEventListener('input', (e) => {
      if (sloganBadge) sloganBadge.style.top = e.target.value + '%';
      document.getElementById('valSloganTop').innerText = e.target.value + '%';
    });

    const ctrlSloganLeft = document.getElementById('ctrlSloganLeft');
    ctrlSloganLeft.addEventListener('input', (e) => {
      if (sloganBadge) sloganBadge.style.left = e.target.value + '%';
      document.getElementById('valSloganLeft').innerText = e.target.value + '%';
    });

    const ctrlSloganWidth = document.getElementById('ctrlSloganWidth');
    ctrlSloganWidth.addEventListener('input', (e) => {
      if (sloganBadge) sloganBadge.style.width = e.target.value + 'px';
      document.getElementById('valSloganWidth').innerText = e.target.value + 'px';
    });

    const ctrlCardWidth = document.getElementById('ctrlCardWidth');
    ctrlCardWidth.addEventListener('input', (e) => {
      if (heroCard) {
        heroCard.style.width = e.target.value + 'vh';
      }
      document.getElementById('valCardWidth').innerText = e.target.value + '%';
    });

    const ctrlCardMarginTop = document.getElementById('ctrlCardMarginTop');
    ctrlCardMarginTop.addEventListener('input', (e) => {
      if (heroCard) {
        heroCard.style.marginTop = e.target.value + 'px';
      }
      document.getElementById('valCardMarginTop').innerText = e.target.value + 'px';
    });

    const ctrlCardRadius = document.getElementById('ctrlCardRadius');
    ctrlCardRadius.addEventListener('input', (e) => {
      if (heroCard) {
        heroCard.style.borderRadius = e.target.value + 'px';
        const img = heroCard.querySelector('img');
        if (img) img.style.borderRadius = e.target.value + 'px';
      }
      document.getElementById('valCardRadius').innerText = e.target.value + 'px';
    });

    const ctrlCardFit = document.getElementById('ctrlCardFit');
    if (ctrlCardFit) {
      ctrlCardFit.addEventListener('change', (e) => {
        if (heroCard) {
          const img = heroCard.querySelector('.hero-card-img');
          if (img) img.style.objectFit = e.target.value;
        }
      });
    }

    const ctrlHeroBorderWidth = document.getElementById('ctrlHeroBorderWidth');
    if (ctrlHeroBorderWidth) {
      ctrlHeroBorderWidth.addEventListener('input', (e) => {
        if (heroCard) heroCard.style.setProperty('--hero-card-border-width', e.target.value + 'px');
        document.getElementById('valHeroBorderWidth').innerText = e.target.value + 'px';
      });
    }

    const ctrlHeroBorderOpacity = document.getElementById('ctrlHeroBorderOpacity');
    if (ctrlHeroBorderOpacity) {
      ctrlHeroBorderOpacity.addEventListener('input', (e) => {
        if (heroCard) heroCard.style.setProperty('--hero-card-border-opacity', e.target.value);
        document.getElementById('valHeroBorderOpacity').innerText = e.target.value;
      });
    }

    const ctrlCoverUpload = document.getElementById('ctrlCoverUpload');
    if (ctrlCoverUpload) {
      ctrlCoverUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result.split(',')[1];
          const ext = file.name.split('.').pop().toLowerCase();

          uploadedCover = {
            name: file.name,
            ext: ext,
            contentType: file.type,
            base64: base64,
            dataUrl: event.target.result
          };

          // Update preview in the DOM instantly
          const coverImg = heroCard.querySelector('.hero-card-img');
          if (coverImg) {
            coverImg.src = event.target.result;
          }
          showEditorToast('메인 이미지가 임시 교체되었습니다. [깃허브 바로 배포] 시 최종 적용됩니다.', 'fa-solid fa-image');
        };
        reader.readAsDataURL(file);
      });
    }

    const ctrlNamesShow = document.getElementById('ctrlNamesShow');
    ctrlNamesShow.addEventListener('change', (e) => {
      if (namesCard) {
        namesCard.style.display = e.target.checked ? 'flex' : 'none';
      }
    });

    const ctrlNamesMargin = document.getElementById('ctrlNamesMargin');
    ctrlNamesMargin.addEventListener('input', (e) => {
      if (namesCard) namesCard.style.marginTop = e.target.value + 'px';
      document.getElementById('valNamesMargin').innerText = e.target.value + 'px';
    });

    const ctrlNamesFont = document.getElementById('ctrlNamesFont');
    ctrlNamesFont.addEventListener('input', (e) => {
      if (namesCard) namesCard.style.fontSize = e.target.value + 'rem';
      document.getElementById('valNamesFont').innerText = e.target.value + 'rem';
    });

    const ctrlNamesPadding = document.getElementById('ctrlNamesPadding');
    ctrlNamesPadding.addEventListener('input', (e) => {
      if (namesCard) {
        namesCard.style.padding = `${e.target.value}px 24px`;
      }
      document.getElementById('valNamesPadding').innerText = e.target.value + 'px';
    });

    // --- Accordion 3: Intro Letter ---
    const ctrlIntroSectionPadding = document.getElementById('ctrlIntroSectionPadding');
    if (ctrlIntroSectionPadding) {
      ctrlIntroSectionPadding.addEventListener('input', (e) => {
        const introSection = document.querySelector('.intro-section');
        if (introSection) introSection.style.setProperty('--intro-section-padding', e.target.value + 'px');
        document.getElementById('valIntroSectionPadding').innerText = e.target.value + 'px';
      });
    }

    const ctrlIntroCardMaxWidth = document.getElementById('ctrlIntroCardMaxWidth');
    if (ctrlIntroCardMaxWidth) {
      ctrlIntroCardMaxWidth.addEventListener('input', (e) => {
        const introCard = document.querySelector('.intro-card');
        if (introCard) introCard.style.setProperty('--intro-card-max-width', e.target.value + 'px');
        document.getElementById('valIntroCardMaxWidth').innerText = e.target.value + 'px';
      });
    }

    const ctrlIntroCardPadding = document.getElementById('ctrlIntroCardPadding');
    if (ctrlIntroCardPadding) {
      ctrlIntroCardPadding.addEventListener('input', (e) => {
        const introCard = document.querySelector('.intro-card');
        if (introCard) introCard.style.setProperty('--intro-card-padding', e.target.value + 'px');
        document.getElementById('valIntroCardPadding').innerText = e.target.value + 'px';
      });
    }

    const ctrlIntroCardMarginTop = document.getElementById('ctrlIntroCardMarginTop');
    if (ctrlIntroCardMarginTop) {
      ctrlIntroCardMarginTop.addEventListener('input', (e) => {
        const introCard = document.querySelector('.intro-card');
        if (introCard) introCard.style.setProperty('--intro-card-margin-top', e.target.value + 'px');
        document.getElementById('valIntroCardMarginTop').innerText = e.target.value + 'px';
      });
    }

    const ctrlIntroCardBorderWidth = document.getElementById('ctrlIntroCardBorderWidth');
    if (ctrlIntroCardBorderWidth) {
      ctrlIntroCardBorderWidth.addEventListener('input', (e) => {
        const introCard = document.querySelector('.intro-card');
        if (introCard) introCard.style.setProperty('--intro-card-border-width', e.target.value + 'px');
        document.getElementById('valIntroCardBorderWidth').innerText = e.target.value + 'px';
      });
    }

    const ctrlIntroCardBorderOpacity = document.getElementById('ctrlIntroCardBorderOpacity');
    if (ctrlIntroCardBorderOpacity) {
      ctrlIntroCardBorderOpacity.addEventListener('input', (e) => {
        const introCard = document.querySelector('.intro-card');
        if (introCard) introCard.style.setProperty('--intro-card-border-opacity', e.target.value);
        document.getElementById('valIntroCardBorderOpacity').innerText = e.target.value;
      });
    }

    // --- Accordion 4: Officer Slide settings ---
    const ctrlFlipAllCards = document.getElementById('ctrlFlipAllCards');
    ctrlFlipAllCards.addEventListener('change', (e) => {
      document.querySelectorAll('.slide-card-inner').forEach(card => {
        if (e.target.checked) {
          card.classList.add('flipped');
        } else {
          card.classList.remove('flipped');
        }
      });
    });

    const ctrlOfficerCardSize = document.getElementById('ctrlOfficerCardSize');
    if (ctrlOfficerCardSize) {
      ctrlOfficerCardSize.addEventListener('input', (e) => {
        const officersSection = document.getElementById('officers');
        if (officersSection) {
          officersSection.style.setProperty('--officer-card-max-width', e.target.value + 'px');
        }
        document.querySelectorAll('.slide-card-inner').forEach(card => {
          card.style.maxWidth = e.target.value + 'px';
        });
        document.getElementById('valOfficerCardSize').innerText = e.target.value + 'px';
      });
    }

    const ctrlOfficerSliderMarginTop = document.getElementById('ctrlOfficerSliderMarginTop');
    if (ctrlOfficerSliderMarginTop) {
      ctrlOfficerSliderMarginTop.addEventListener('input', (e) => {
        const officersSection = document.getElementById('officers');
        if (officersSection) officersSection.style.setProperty('--officer-slider-margin-top', e.target.value + 'px');
        document.getElementById('valOfficerSliderMarginTop').innerText = e.target.value + 'px';
      });
    }

    const ctrlOfficerCardRadius = document.getElementById('ctrlOfficerCardRadius');
    if (ctrlOfficerCardRadius) {
      ctrlOfficerCardRadius.addEventListener('input', (e) => {
        const officersSection = document.getElementById('officers');
        if (officersSection) officersSection.style.setProperty('--officer-card-radius', e.target.value + 'px');
        document.getElementById('valOfficerCardRadius').innerText = e.target.value + 'px';
      });
    }

    const ctrlOfficerCardBorderWidth = document.getElementById('ctrlOfficerCardBorderWidth');
    if (ctrlOfficerCardBorderWidth) {
      ctrlOfficerCardBorderWidth.addEventListener('input', (e) => {
        const officersSection = document.getElementById('officers');
        if (officersSection) officersSection.style.setProperty('--officer-card-border-width', e.target.value + 'px');
        document.getElementById('valOfficerCardBorderWidth').innerText = e.target.value + 'px';
      });
    }

    const ctrlOfficerCardBorderOpacity = document.getElementById('ctrlOfficerCardBorderOpacity');
    if (ctrlOfficerCardBorderOpacity) {
      ctrlOfficerCardBorderOpacity.addEventListener('input', (e) => {
        const officersSection = document.getElementById('officers');
        if (officersSection) officersSection.style.setProperty('--officer-card-border-opacity', e.target.value);
        document.getElementById('valOfficerCardBorderOpacity').innerText = e.target.value;
      });
    }

    const ctrlOfficerCardPadding = document.getElementById('ctrlOfficerCardPadding');
    if (ctrlOfficerCardPadding) {
      ctrlOfficerCardPadding.addEventListener('input', (e) => {
        const officersSection = document.getElementById('officers');
        if (officersSection) officersSection.style.setProperty('--officer-card-padding', e.target.value + 'px');
        document.getElementById('valOfficerCardPadding').innerText = e.target.value + 'px';
      });
    }

    const ctrlOfficerCardJustify = document.getElementById('ctrlOfficerCardJustify');
    if (ctrlOfficerCardJustify) {
      ctrlOfficerCardJustify.addEventListener('change', (e) => {
        const officersSection = document.getElementById('officers');
        if (officersSection) officersSection.style.setProperty('--officer-card-justify', e.target.value);
      });
    }

    // --- Accordion 5: Worship details/countdown ---
    const ctrlDetailsSectionPadding = document.getElementById('ctrlDetailsSectionPadding');
    if (ctrlDetailsSectionPadding) {
      ctrlDetailsSectionPadding.addEventListener('input', (e) => {
        const detailsSection = document.getElementById('details');
        if (detailsSection) detailsSection.style.setProperty('--details-section-padding', e.target.value + 'px');
        document.getElementById('valDetailsSectionPadding').innerText = e.target.value + 'px';
      });
    }

    const ctrlDetailsCardRadius = document.getElementById('ctrlDetailsCardRadius');
    if (ctrlDetailsCardRadius) {
      ctrlDetailsCardRadius.addEventListener('input', (e) => {
        const detailsSection = document.getElementById('details');
        if (detailsSection) detailsSection.style.setProperty('--details-card-radius', e.target.value + 'px');
        document.getElementById('valDetailsCardRadius').innerText = e.target.value + 'px';
      });
    }

    const ctrlDetailsLayoutGap = document.getElementById('ctrlDetailsLayoutGap');
    if (ctrlDetailsLayoutGap) {
      ctrlDetailsLayoutGap.addEventListener('input', (e) => {
        const detailsSection = document.getElementById('details');
        if (detailsSection) detailsSection.style.setProperty('--details-layout-gap', e.target.value + 'px');
        document.getElementById('valDetailsLayoutGap').innerText = e.target.value + 'px';
      });
    }

    const ctrlCountdownNumberSize = document.getElementById('ctrlCountdownNumberSize');
    if (ctrlCountdownNumberSize) {
      ctrlCountdownNumberSize.addEventListener('input', (e) => {
        const detailsSection = document.getElementById('details');
        if (detailsSection) detailsSection.style.setProperty('--countdown-number-size', e.target.value + 'rem');
        document.getElementById('valCountdownNumberSize').innerText = e.target.value + 'rem';
      });
    }

    // --- Accordion 6: Map Settings ---
    const ctrlMapWidth = document.getElementById('ctrlMapWidth');
    ctrlMapWidth.addEventListener('input', (e) => {
      if (directionsMap) {
        directionsMap.style.width = e.target.value + '%';
        directionsMap.style.marginLeft = 'auto';
        directionsMap.style.marginRight = 'auto';
      }
      document.getElementById('valMapWidth').innerText = e.target.value + '%';
    });

    const ctrlMapRadius = document.getElementById('ctrlMapRadius');
    ctrlMapRadius.addEventListener('input', (e) => {
      if (directionsMap) {
        directionsMap.style.borderRadius = e.target.value + 'px';
        const img = directionsMap.querySelector('img');
        if (img) img.style.borderRadius = e.target.value + 'px';
      }
      document.getElementById('valMapRadius').innerText = e.target.value + 'px';
    });

    const ctrlMapMarginTop = document.getElementById('ctrlMapMarginTop');
    ctrlMapMarginTop.addEventListener('input', (e) => {
      if (directionsMap) {
        directionsMap.style.marginTop = e.target.value + 'px';
      }
      document.getElementById('valMapMarginTop').innerText = e.target.value + 'px';
    });

    const ctrlMapUpload = document.getElementById('ctrlMapUpload');
    ctrlMapUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result.split(',')[1];
        const ext = file.name.split('.').pop().toLowerCase();

        uploadedMap = {
          name: file.name,
          ext: ext,
          contentType: file.type,
          base64: base64,
          dataUrl: event.target.result
        };

        // Update preview in the DOM instantly
        const mapImg = directionsMap.querySelector('.directions-card-img');
        if (mapImg) {
          mapImg.src = event.target.result;
        }
        showEditorToast('약도 이미지가 임시 교체되었습니다. [깃허브 바로 배포] 시 최종 적용됩니다.', 'fa-solid fa-image');
      };
      reader.readAsDataURL(file);
    });

    // --- Accordion 7: Guestbook Settings ---
    const ctrlGuestbookSectionPadding = document.getElementById('ctrlGuestbookSectionPadding');
    if (ctrlGuestbookSectionPadding) {
      ctrlGuestbookSectionPadding.addEventListener('input', (e) => {
        const guestbookSection = document.getElementById('guestbook');
        if (guestbookSection) guestbookSection.style.setProperty('--guestbook-section-padding', e.target.value + 'px');
        document.getElementById('valGuestbookSectionPadding').innerText = e.target.value + 'px';
      });
    }

    const ctrlGuestbookLayoutGap = document.getElementById('ctrlGuestbookLayoutGap');
    if (ctrlGuestbookLayoutGap) {
      ctrlGuestbookLayoutGap.addEventListener('input', (e) => {
        const guestbookSection = document.getElementById('guestbook');
        if (guestbookSection) guestbookSection.style.setProperty('--guestbook-layout-gap', e.target.value + 'px');
        document.getElementById('valGuestbookLayoutGap').innerText = e.target.value + 'px';
      });
    }

    // --- Actions ---
    document.getElementById('btnExport').addEventListener('click', exportHTML);
    document.getElementById('btnReset').addEventListener('click', resetLocalEdits);
    document.getElementById('btnPublish').addEventListener('click', publishToGitHub);
  }

  function togglePanel(open) {
    if (open === undefined) open = !isPanelOpen;
    isPanelOpen = open;
    
    if (panelEl) {
      if (open) {
        panelEl.classList.add('open');
      } else {
        panelEl.classList.remove('open');
      }
    }
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

  function getCleanHTML() {
    // 1. Temporarily turn off editing mode attributes and clean elements
    enableEditing(false);
    
    // Store original flipped states so we can restore them in the UI after serialization
    const flippedCards = [];
    document.querySelectorAll('.slide-card-inner').forEach((card, idx) => {
      if (card.classList.contains('flipped')) {
        flippedCards.push(idx);
        card.classList.remove('flipped');
      }
    });

    // Store original image src for restoration if uploadedMap is present
    let originalMapSrc = null;
    let mapImg = null;
    if (uploadedMap && directionsMap) {
      mapImg = directionsMap.querySelector('.directions-card-img');
      if (mapImg) {
        originalMapSrc = mapImg.getAttribute('src');
        // Point to the relative filename that will be committed to GitHub
        mapImg.setAttribute('src', `assets/directions_card_uploaded.${uploadedMap.ext}`);
      }
    }

    // Store original cover src for restoration if uploadedCover is present
    let originalCoverSrc = null;
    let coverImg = null;
    if (uploadedCover && heroCard) {
      coverImg = heroCard.querySelector('.hero-card-img');
      if (coverImg) {
        originalCoverSrc = coverImg.getAttribute('src');
        // Point to the relative filename that will be committed to GitHub
        coverImg.setAttribute('src', `assets/hero_card_uploaded.${uploadedCover.ext}`);
      }
    }
    
    // Update password attribute on the trigger button so it persists in the HTML (hashed!)
    const triggerBtn = document.getElementById('adminEditTrigger');
    const ctrlAdminPassword = document.getElementById('ctrlAdminPassword');
    if (triggerBtn) {
      if (ctrlAdminPassword && ctrlAdminPassword.value.trim() !== '') {
        const hashedPass = simpleHash(ctrlAdminPassword.value.trim());
        triggerBtn.setAttribute('data-auth', hashedPass);
      }
      triggerBtn.removeAttribute('data-password'); // Remove legacy attribute
    }

    // Remove temporary tags
    const panel = document.getElementById('adminPanel');
    const scripts = document.querySelectorAll('script');
    
    if (panel) panel.remove();
    
    // Find the editor script tag and remove it
    scripts.forEach(script => {
      if (script.src.includes('editor.js')) {
        script.remove();
      }
    });

    // Get clean html string
    const htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    
    // 2. Re-initialize / Restore panel & editing mode
    createPanel();
    if (isPanelOpen) {
      panelEl.classList.add('open');
    }
    enableEditing(true);

    // Restore flipped states in the UI
    flippedCards.forEach(idx => {
      const card = document.querySelectorAll('.slide-card-inner')[idx];
      if (card) card.classList.add('flipped');
    });

    // Restore image preview src back to dataUrl (Base64) locally
    if (mapImg && originalMapSrc) {
      mapImg.setAttribute('src', originalMapSrc);
    }

    // Restore cover preview src back to dataUrl (Base64) locally
    if (coverImg && originalCoverSrc) {
      coverImg.setAttribute('src', originalCoverSrc);
    }

    return htmlContent;
  }

  function exportHTML() {
    const html = getCleanHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'index.html';
    link.click();
    showEditorToast('HTML 파일이 생성되어 다운로드되었습니다.', 'fa-solid fa-file-arrow-down');
  }

  function resetLocalEdits() {
    if (confirm('편집 중이던 임시 레이아웃과 텍스트를 모두 버리고 새로고침하시겠습니까? (이전 저장 데이터로 복귀)')) {
      location.reload();
    }
  }

  async function publishToGitHub() {
    const user = document.getElementById('ghUser').value.trim();
    const repo = document.getElementById('ghRepo').value.trim();
    const token = document.getElementById('ghToken').value.trim();

    if (!user || !repo || !token) {
      alert('GitHub 아이디, 저장소 이름, Personal Access Token(PAT)을 모두 입력해야 합니다.');
      return;
    }

    // Save tokens locally for convenience
    localStorage.setItem('saerom_github_token', token);
    localStorage.setItem('saerom_github_user', user);
    localStorage.setItem('saerom_github_repo', repo);

    if (!confirm('현재 화면에 보이는 디자인과 수정된 텍스트 그대로 깃허브(GitHub Pages)에 배포하시겠습니까?\n배포 시 실시간 초청장이 전 세계에 업데이트됩니다.')) {
      return;
    }

    const btnPublish = document.getElementById('btnPublish');
    const originalText = btnPublish.innerHTML;
    btnPublish.disabled = true;

    try {
      // Step 1: Upload cover image first if uploadedCover exists
      if (uploadedCover) {
        btnPublish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 메인 이미지 업로드 중...';
        
        const imgPath = `assets/hero_card_uploaded.${uploadedCover.ext}`;
        const imgUrl = `https://api.github.com/repos/${user}/${repo}/contents/${imgPath}`;
        
        let imgSha = null;
        const imgCheckRes = await fetch(imgUrl, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (imgCheckRes.ok) {
          const imgData = await imgCheckRes.json();
          imgSha = imgData.sha;
        }

        const imgPutRes = await fetch(imgUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'media: upload new main cover image via SaeromVisualEditor',
            content: uploadedCover.base64,
            sha: imgSha || undefined,
            branch: 'main'
          })
        });

        if (!imgPutRes.ok) {
          const imgErr = await imgPutRes.json();
          throw new Error('메인 이미지 업로드 실패: ' + (imgErr.message || '알 수 없는 오류'));
        }
      }

      // Step 2: Upload directions image first if uploadedMap exists
      if (uploadedMap) {
        btnPublish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 약도 이미지 업로드 중...';
        
        const imgPath = `assets/directions_card_uploaded.${uploadedMap.ext}`;
        const imgUrl = `https://api.github.com/repos/${user}/${repo}/contents/${imgPath}`;
        
        // Check if image already exists to get SHA (prevent overwrite conflicts)
        let imgSha = null;
        const imgCheckRes = await fetch(imgUrl, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (imgCheckRes.ok) {
          const imgData = await imgCheckRes.json();
          imgSha = imgData.sha;
        }

        // Upload the new image asset
        const imgPutRes = await fetch(imgUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'media: upload new directions map image via SaeromVisualEditor',
            content: uploadedMap.base64,
            sha: imgSha || undefined,
            branch: 'main'
          })
        });

        if (!imgPutRes.ok) {
          const imgErr = await imgPutRes.json();
          throw new Error('약도 이미지 업로드 실패: ' + (imgErr.message || '알 수 없는 오류'));
        }
      }

      // Step 2: Now publish index.html
      btnPublish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 배포 파일 빌드 중...';
      const cleanHTML = getCleanHTML();
      
      btnPublish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 깃허브 연결 확인 중...';
      
      const fileUrl = `https://api.github.com/repos/${user}/${repo}/contents/index.html`;
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`저장소 정보를 읽지 못했습니다 (${response.status}). 아이디, 저장소 이름, 토큰 권한(repo)을 확인해 주세요.`);
      }

      const fileData = await response.json();
      const sha = fileData.sha;

      btnPublish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 실시간 커밋 푸시 중...';

      // Unicode safe Base64 encoder
      const base64Content = btoa(unescape(encodeURIComponent(cleanHTML)));

      // Put the updated HTML content to GitHub repo
      const putResponse = await fetch(fileUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'design: update invitation page visually via SaeromVisualEditor',
          content: base64Content,
          sha: sha,
          branch: 'main'
        })
      });

      if (!putResponse.ok) {
        const errorData = await putResponse.json();
        throw new Error(errorData.message || '파일 업데이트에 실패했습니다.');
      }

      showEditorToast('실시간 배포 성공! 약 1분 후 실제 모바일 초청장에 최종 디자인이 반영됩니다.', 'fa-solid fa-cloud-arrow-up');
    } catch (err) {
      alert(`배포 실패: ${err.message}`);
    } finally {
      btnPublish.innerHTML = originalText;
      btnPublish.disabled = false;
    }
  }

  function showEditorToast(message, iconClass) {
    if (window.showToast) {
      window.showToast(message, iconClass);
    } else {
      alert(message);
    }
  }

  return {
    init: init,
    togglePanel: togglePanel
  };
})();
