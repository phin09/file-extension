// API 기본 URL
const API_BASE_URL = '/api/blocked-extension';

// 고정 확장자 목록 (프론트엔드에 하드코딩)
const FIXED_EXTENSIONS = ['bat', 'cmd', 'com', 'cpl', 'exe', 'scr', 'js'];

// MIME-DB CDN URL
const MIME_DB_URL = 'https://cdn.jsdelivr.net/npm/mime-db@latest/db.json';

// 폴백: 기본 알려진 확장자 목록
const FALLBACK_EXTENSIONS = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm',
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
    'js', 'ts', 'py', 'java', 'cpp', 'c', 'h', 'html', 'css', 'json', 'xml',
    'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sh', 'sql'
];

// 알려진 확장자 목록 (mime-db에서 로드)
let knownExtensions = new Set(FALLBACK_EXTENSIONS);

// DOM 요소
const fixedExtensionsEl = document.getElementById('fixedExtensions');
const customExtensionsEl = document.getElementById('customExtensions');
const customCountEl = document.getElementById('customCount');
const customInputEl = document.getElementById('customExtensionInput');
const addCustomBtnEl = document.getElementById('addCustomBtn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

// 상태 관리
let blockedExtensions = []; // 서버에서 가져온 전체 차단 확장자 목록
let isLoading = false;

/**
 * 로딩 상태 표시/숨김
 */
function setLoading(loading) {
    isLoading = loading;
    loadingEl.style.display = loading ? 'block' : 'none';
}

/**
 * 에러 메시지 표시
 */
function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

/**
 * API: 전체 차단 확장자 목록 조회
 */
async function fetchBlockedExtensions() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('차단 확장자 목록을 불러오는데 실패했습니다');
        }
        const data = await response.json();
        return data.data; // [{ id, extension, createdAt }]
    } catch (error) {
        console.error('Error fetching blocked extensions:', error);
        showError(error.message);
        return [];
    }
}

/**
 * API: 차단 확장자 추가
 */
async function addBlockedExtension(extension) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ extension }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '확장자 추가에 실패했습니다');
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error adding blocked extension:', error);
        showError(error.message);
        throw error;
    }
}

/**
 * API: 차단 확장자 삭제
 */
async function deleteBlockedExtension(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '확장자 삭제에 실패했습니다');
        }
    } catch (error) {
        console.error('Error deleting blocked extension:', error);
        showError(error.message);
        throw error;
    }
}

/**
 * 고정 확장자 체크박스 렌더링
 */
function renderFixedExtensions() {
    fixedExtensionsEl.innerHTML = '';

    FIXED_EXTENSIONS.forEach((ext) => {
        const isChecked = blockedExtensions.some((blocked) => blocked.extension === ext);

        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `fixed-${ext}`;
        checkbox.value = ext;
        checkbox.checked = isChecked;
        checkbox.disabled = false; // 활성화 상태로 시작

        checkbox.addEventListener('change', async (e) => {
            const extension = e.target.value;
            const checked = e.target.checked;

            // UI 즉시 업데이트 방지 (서버 응답 대기)
            e.target.disabled = true;

            try {
                if (checked) {
                    // 체크: 서버에 추가
                    const newItem = await addBlockedExtension(extension);
                    blockedExtensions.push(newItem);
                } else {
                    // 언체크: 서버에서 삭제
                    const item = blockedExtensions.find((b) => b.extension === extension);
                    if (item) {
                        await deleteBlockedExtension(item.id);
                        blockedExtensions = blockedExtensions.filter((b) => b.id !== item.id);
                    }
                }
            } catch (error) {
                // 에러 발생 시 체크박스 상태 복원
                e.target.checked = !checked;
            } finally {
                e.target.disabled = false;
            }
        });

        const label = document.createElement('label');
        label.htmlFor = `fixed-${ext}`;
        label.textContent = ext;

        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        fixedExtensionsEl.appendChild(checkboxItem);
    });
}

/**
 * 커스텀 확장자 목록 가져오기 (고정 확장자 제외)
 */
function getCustomExtensions() {
    return blockedExtensions.filter((b) => !FIXED_EXTENSIONS.includes(b.extension));
}

/**
 * 커스텀 확장자 개수 업데이트
 */
function updateCustomCount() {
    const customExtensions = getCustomExtensions();
    customCountEl.textContent = customExtensions.length;
}

/**
 * 커스텀 확장자 렌더링
 */
function renderCustomExtensions() {
    customExtensionsEl.innerHTML = '';

    const customExtensions = getCustomExtensions();

    customExtensions.forEach((item) => {
        const tag = document.createElement('div');
        tag.className = 'custom-tag';

        const text = document.createElement('span');
        text.textContent = item.extension;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.title = '삭제';
        deleteBtn.addEventListener('click', async () => {
            try {
                await deleteBlockedExtension(item.id);
                blockedExtensions = blockedExtensions.filter((b) => b.id !== item.id);
                renderCustomExtensions();
                updateCustomCount();
            } catch (error) {
                // 에러는 이미 showError로 표시됨
            }
        });

        tag.appendChild(text);
        tag.appendChild(deleteBtn);
        customExtensionsEl.appendChild(tag);
    });

    updateCustomCount();
}

/**
 * MIME-DB에서 알려진 확장자 목록 로드
 */
async function loadKnownExtensions() {
    try {
        const response = await fetch(MIME_DB_URL);
        if (!response.ok) throw new Error('MIME-DB 로드 실패');
        
        const mimeDb = await response.json();
        const extensions = new Set();
        
        // mime-db에서 모든 확장자 추출
        Object.values(mimeDb).forEach((mimeType) => {
            if (mimeType.extensions) {
                mimeType.extensions.forEach((ext) => extensions.add(ext));
            }
        });
        
        knownExtensions = extensions;
        console.log(`✅ ${extensions.size}개의 알려진 확장자 로드 완료`);
    } catch (error) {
        console.warn('⚠️ MIME-DB 로드 실패, 폴백 목록 사용:', error);
        knownExtensions = new Set(FALLBACK_EXTENSIONS);
    }
}

/**
 * 확장자가 알려진 확장자인지 확인
 */
function isKnownExtension(extension) {
    return knownExtensions.has(extension);
}

/**
 * 커스텀 확장자 추가
 */
async function handleAddCustomExtension() {
    const input = customInputEl.value.trim();

    if (!input) {
        showError('확장자를 입력해주세요');
        return;
    }

    // 확장자 정규화 (점 제거, 소문자 변환)
    const normalized = input.toLowerCase().replace(/^\.+/, '');

    if (!normalized) {
        showError('유효한 확장자를 입력해주세요');
        return;
    }

    if (normalized.length > 20) {
        showError('확장자는 최대 20자까지 입력 가능합니다');
        return;
    }

    // 고정 확장자인 경우 체크박스에 추가
    if (FIXED_EXTENSIONS.includes(normalized)) {
        // 이미 체크되어 있는지 확인
        const isAlreadyBlocked = blockedExtensions.some((b) => b.extension === normalized);
        
        if (isAlreadyBlocked) {
            showError(`"${normalized}"는 이미 고정 확장자로 등록되어 있습니다`);
        } else {
            // 고정 확장자 체크박스 체크
            try {
                const newItem = await addBlockedExtension(normalized);
                blockedExtensions.push(newItem);
                renderFixedExtensions(); // 고정 확장자 UI 업데이트
                showError(`"${normalized}"를 고정 확장자로 추가했습니다`);
            } catch (error) {
                // 에러는 이미 showError로 표시됨
            }
        }
        customInputEl.value = ''; // 입력창 초기화
        return;
    }

    // 이미 등록된 확장자 체크
    if (blockedExtensions.some((b) => b.extension === normalized)) {
        showError('이미 등록된 확장자입니다');
        return;
    }

    // 최대 개수 체크 (커스텀만 200개)
    const customExtensions = getCustomExtensions();
    if (customExtensions.length >= 200) {
        showError('커스텀 확장자는 최대 200개까지만 등록 가능합니다');
        return;
    }

    // MIME 타입 검증 (알려지지 않은 확장자 경고)
    if (!isKnownExtension(normalized)) {
        const confirmed = confirm(
            `⚠️ 알 수 없는 확장자\n\n` +
            `"${normalized}"은(는) 알려지지 않은 확장자입니다.\n` +
            `그래도 저장하시겠습니까?`
        );
        
        if (!confirmed) {
            return; // 취소 선택 시 저장 안 함
        }
    }

    // 저장
    try {
        const newItem = await addBlockedExtension(normalized);
        blockedExtensions.push(newItem);
        renderCustomExtensions();
        customInputEl.value = ''; // 입력창 초기화
    } catch (error) {
        // 에러는 이미 showError로 표시됨
    }
}

/**
 * 초기 데이터 로드
 */
async function init() {
    setLoading(true);

    try {
        // mime-db 로드 (비동기, 백그라운드)
        loadKnownExtensions(); // await 없이 실행 (블로킹하지 않음)

        // 서버에서 차단 확장자 목록 조회
        blockedExtensions = await fetchBlockedExtensions();

        // UI 렌더링
        renderFixedExtensions();
        renderCustomExtensions();
    } catch (error) {
        console.error('Initialization error:', error);
    } finally {
        setLoading(false);
    }
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    init();

    // 추가 버튼 클릭
    addCustomBtnEl.addEventListener('click', handleAddCustomExtension);

    // Enter 키로 추가
    customInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddCustomExtension();
        }
    });
});

