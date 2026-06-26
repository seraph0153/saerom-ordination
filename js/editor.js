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

  function init() {
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

  function enableEditing(enable) {
    isEditing = enable;
    if (enable) {
      document.body.classList.add('admin-mode-active');
      document.querySelectorAll('.editable').forEach(el => {
        el.setAttribute('contenteditable', 'true');
      });
    } else {
      document.body.classList.remove('admin-mode-active');
      document.querySelectorAll('.editable').forEach(el => {
        el.removeAttribute('contenteditable');
      });
    }
  }

  function createPanel() {
    // If panel already exists, don't recreate
    if (document.getElementById('adminPanel')) return;

    panelEl = document.createElement('div');
    panelEl.id = 'adminPanel';
    panelEl.className = 'admin-panel';
    
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

    // Directions Map initial values
    let mapWidth = directionsMap ? parseInt(directionsMap.style.width) || 100 : 100;
    let mapRadius = directionsMap ? parseInt(directionsMap.style.borderRadius) || 16 : 16;

    // Retrieve saved GitHub settings
    const savedToken = localStorage.getItem('saerom_github_token') || '';
    const savedUser = localStorage.getItem('saerom_github_user') || 'seraph0153';
    const savedRepo = localStorage.getItem('saerom_github_repo') || 'saerom-ordination';

    panelEl.innerHTML = `
      <div class="admin-panel-header">
        <h3><i class="fa-solid fa-sliders"></i> 실시간 디자인 편집기</h3>
        <button class="admin-panel-close" id="adminPanelClose"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="admin-panel-body">
        
        <!-- Slogan Badge Control Section -->
        <div>
          <div class="admin-section-title">슬로건 배지 설정</div>
          
          <div class="admin-toggle-wrapper">
            <span>슬로건 노출 여부</span>
            <label class="admin-switch">
              <input type="checkbox" id="ctrlSloganShow" ${sloganShow ? 'checked' : ''}>
              <span class="admin-slider-switch"></span>
            </label>
          </div>
          
          <div class="admin-control-group">
            <label>상단 위치 <span class="value-display" id="valSloganTop">${sloganTop}%</span></label>
            <input type="range" class="admin-slider" id="ctrlSloganTop" min="0" max="90" step="0.5" value="${sloganTop}">
          </div>

          <div class="admin-control-group">
            <label>좌측 위치 <span class="value-display" id="valSloganLeft">${sloganLeft}%</span></label>
            <input type="range" class="admin-slider" id="ctrlSloganLeft" min="0" max="90" step="0.5" value="${sloganLeft}">
          </div>

          <div class="admin-control-group">
            <label>배지 크기 <span class="value-display" id="valSloganWidth">${sloganWidth}px</span></label>
            <input type="range" class="admin-slider" id="ctrlSloganWidth" min="30" max="180" value="${sloganWidth}">
          </div>
        </div>

        <!-- Hero Card Settings -->
        <div>
          <div class="admin-section-title">초청장 카드 크기</div>
          <div class="admin-control-group">
            <label>가로 폭 (데스크톱 비율) <span class="value-display" id="valCardWidth">${cardWidth}%</span></label>
            <input type="range" class="admin-slider" id="ctrlCardWidth" min="50" max="100" value="${cardWidth}">
          </div>
        </div>

        <!-- Names Card Control Section -->
        <div>
          <div class="admin-section-title">임직 대상자 성함 카드</div>
          
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

        <!-- Directions Map Section -->
        <div>
          <div class="admin-section-title">오시는 길 약도 설정</div>
          <div class="admin-control-group">
            <label>약도 가로 폭 <span class="value-display" id="valMapWidth">${mapWidth}%</span></label>
            <input type="range" class="admin-slider" id="ctrlMapWidth" min="50" max="100" value="${mapWidth}">
          </div>
          <div class="admin-control-group">
            <label>둥근 모서리 <span class="value-display" id="valMapRadius">${mapRadius}px</span></label>
            <input type="range" class="admin-slider" id="ctrlMapRadius" min="0" max="40" value="${mapRadius}">
          </div>
        </div>

        <!-- GitHub Integration Section -->
        <div>
          <div class="admin-section-title">깃허브 실시간 배포 정보</div>
          <div class="admin-github-settings">
            <input type="text" id="ghUser" placeholder="GitHub 아이디" value="${savedUser}">
            <input type="text" id="ghRepo" placeholder="저장소 이름 (saerom-ordination)" value="${savedRepo}">
            <input type="password" id="ghToken" placeholder="GitHub Personal Token (PAT)" value="${savedToken}">
            <small style="color: #64748B; font-size: 0.7rem; line-height: 1.3; display: block;">
              ※ 입력하신 토큰 정보는 서버로 전송되지 않고 본인의 브라우저 안전 저장소(localStorage)에만 저장됩니다.
            </small>
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

    // --- Slogan Badge Listeners ---
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

    // --- Hero Card Width ---
    const ctrlCardWidth = document.getElementById('ctrlCardWidth');
    ctrlCardWidth.addEventListener('input', (e) => {
      if (heroCard) {
        heroCard.style.width = e.target.value + 'vh';
      }
      document.getElementById('valCardWidth').innerText = e.target.value + '%';
    });

    // --- Names Card Listeners ---
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

    // --- Directions Map Listeners ---
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

  function getCleanHTML() {
    // 1. Temporarily turn off editing mode attributes and clean elements
    enableEditing(false);
    
    // Remove temporary tags
    const triggerBtn = document.getElementById('adminEditTrigger');
    const panel = document.getElementById('adminPanel');
    const scripts = document.querySelectorAll('script');
    
    if (triggerBtn) triggerBtn.remove();
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
    
    // Restore trigger button in DOM
    if (!document.getElementById('adminEditTrigger')) {
      const btn = document.createElement('button');
      btn.id = 'adminEditTrigger';
      btn.className = 'admin-edit-trigger';
      btn.innerHTML = '<i class="fa-solid fa-gear"></i>';
      document.body.appendChild(btn);
      
      // Re-attach main.js listener to trigger button
      btn.addEventListener('click', () => {
        togglePanel();
      });
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
    btnPublish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 배포 파일 빌드 중...';
    btnPublish.disabled = true;

    try {
      const cleanHTML = getCleanHTML();
      
      btnPublish.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 깃허브 연결 확인 중...';
      
      // Step 1: Request the SHA of index.html from GitHub
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

      // Step 2: Unicode safe Base64 encoder
      const base64Content = btoa(unescape(encodeURIComponent(cleanHTML)));

      // Step 3: Put the updated file content to GitHub repo
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
