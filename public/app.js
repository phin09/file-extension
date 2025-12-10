// API 기본 URL
const API_BASE_URL = '/api/blocked-extension';

// 고정 확장자 목록 (프론트엔드에 하드코딩)
const FIXED_EXTENSIONS = ['bat', 'cmd', 'com', 'cpl', 'exe', 'scr', 'js'];

// DOM 요소
const fixedExtensionsEl = document.getElementById('fixedExtensions');
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
        return data.data; // [{ id, extension, createdAt, updatedAt }]
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
 * 초기 데이터 로드
 */
async function init() {
    setLoading(true);

    try {
        // 서버에서 차단 확장자 목록 조회
        blockedExtensions = await fetchBlockedExtensions();

        // UI 렌더링
        renderFixedExtensions();
    } catch (error) {
        console.error('Initialization error:', error);
    } finally {
        setLoading(false);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);

