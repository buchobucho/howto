/**
 * プログラミングスクール LP - JavaScript
 * インタラクティブ機能の実装
 */

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', () => {
  // 各機能を初期化
  initMobileMenu();
  initSmoothScroll();
  initFAQ();
  initScrollReveal();
  initHeaderScroll();
  initFormValidation();
});

/**
 * モバイルメニューの開閉機能
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (!menuToggle || !nav) return;

  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });

  // メニューリンクをクリックしたらメニューを閉じる
  const navLinks = document.querySelectorAll('.nav-list a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });

  // メニュー外をクリックしたら閉じる
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
      nav.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });
}

/**
 * スムーズスクロール機能
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // ハッシュのみの場合はスキップ
      if (href === '#') return;

      e.preventDefault();

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * FAQアコーディオン機能
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      // 他のアイテムを閉じる
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // クリックされたアイテムをトグル
      item.classList.toggle('active');
    });
  });
}

/**
 * スクロール表示アニメーション
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');

  if (revealElements.length === 0) return;

  // Intersection Observer API を使用
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // 一度表示されたら監視を解除（パフォーマンス向上）
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * ヘッダースクロール時の挙動
 */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  let lastScrollTop = 0;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // スクロール方向を判定
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // 下にスクロール（ヘッダーを隠す）
      header.style.transform = 'translateY(-100%)';
    } else {
      // 上にスクロール（ヘッダーを表示）
      header.style.transform = 'translateY(0)';
    }

    // スクロール位置によってヘッダーのスタイルを変更
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScrollTop = scrollTop;
  });
}

/**
 * フォームバリデーション
 */
function initFormValidation() {
  const form = document.querySelector('.cta-form');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // フォームデータを取得
    const formData = {
      name: form.querySelector('[name="name"]').value,
      email: form.querySelector('[name="email"]').value,
      phone: form.querySelector('[name="phone"]').value,
      course: form.querySelector('[name="course"]').value,
      message: form.querySelector('[name="message"]').value
    };

    // バリデーション
    if (!validateForm(formData)) {
      return;
    }

    // 送信ボタンを無効化
    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '送信中...';

    // 実際のフォーム送信処理
    try {
      // ここに実際のAPI送信処理を実装
      await submitForm(formData);

      // 成功メッセージを表示
      showMessage('success', 'お問い合わせありがとうございます！担当者より3営業日以内にご連絡いたします。');

      // フォームをリセット
      form.reset();
    } catch (error) {
      // エラーメッセージを表示
      showMessage('error', 'エラーが発生しました。しばらくしてから再度お試しください。');
    } finally {
      // 送信ボタンを有効化
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

/**
 * フォームバリデーション
 */
function validateForm(data) {
  // 名前チェック
  if (!data.name || data.name.trim().length < 2) {
    showMessage('error', 'お名前を正しく入力してください（2文字以上）');
    return false;
  }

  // メールアドレスチェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    showMessage('error', '有効なメールアドレスを入力してください');
    return false;
  }

  // 電話番号チェック（任意項目だが、入力されている場合は検証）
  if (data.phone) {
    const phoneRegex = /^[\d\s\-()]+$/;
    if (!phoneRegex.test(data.phone)) {
      showMessage('error', '有効な電話番号を入力してください');
      return false;
    }
  }

  return true;
}

/**
 * フォーム送信処理（ダミー実装）
 */
async function submitForm(data) {
  // 実際のAPI送信処理を実装する場合はここに記述
  // 例: fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })

  // デモ用に2秒待機
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('フォームデータ:', data);
      resolve();
    }, 2000);
  });
}

/**
 * メッセージ表示
 */
function showMessage(type, message) {
  // 既存のメッセージがあれば削除
  const existingMessage = document.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // メッセージ要素を作成
  const messageElement = document.createElement('div');
  messageElement.className = `form-message form-message-${type}`;
  messageElement.textContent = message;

  // スタイルを設定
  messageElement.style.cssText = `
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    font-weight: 600;
    text-align: center;
    animation: slideDown 0.3s ease;
    ${type === 'success'
      ? 'background: #d1fae5; color: #065f46; border: 2px solid #10b981;'
      : 'background: #fee2e2; color: #991b1b; border: 2px solid #ef4444;'}
  `;

  // フォームの先頭に挿入
  const form = document.querySelector('.cta-form');
  form.insertBefore(messageElement, form.firstChild);

  // 5秒後に自動削除
  setTimeout(() => {
    messageElement.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => messageElement.remove(), 300);
  }, 5000);
}

/**
 * 統計数値のカウントアップアニメーション
 */
function initCountUpAnimation() {
  const stats = document.querySelectorAll('.stat-number');

  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetValue = target.textContent;
        const numericValue = parseInt(targetValue.replace(/[^0-9]/g, ''));

        if (!isNaN(numericValue)) {
          animateValue(target, 0, numericValue, 2000, targetValue);
          observer.unobserve(target);
        }
      }
    });
  }, observerOptions);

  stats.forEach(stat => observer.observe(stat));
}

/**
 * 数値アニメーション
 */
function animateValue(element, start, end, duration, originalText) {
  const startTime = performance.now();
  const suffix = originalText.replace(/[0-9]/g, '');

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // イージング関数（ease-out）
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * easeOut);

    element.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// カウントアップアニメーションを初期化
if (document.querySelector('.stat-number')) {
  initCountUpAnimation();
}

/**
 * CSSアニメーション定義を追加
 */
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// ページ読み込み時のアニメーション
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// コンソールに開発情報を出力
console.log('%c🎓 プログラミングスクール LP', 'font-size: 20px; font-weight: bold; color: #2563eb;');
console.log('%cVersion: 1.0.0', 'color: #6b7280;');
console.log('%cDeveloped with ❤️', 'color: #10b981;');
