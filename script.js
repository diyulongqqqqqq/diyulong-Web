// 防抖函数
function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// 导航栏滚动效果
// 文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 导航栏滚动效果（简化版）
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      navbar.classList.toggle('scrolled', isScrolled);
    };
    
    window.addEventListener('scroll', debounce(handleScroll, 10));
  }

  // 移动端菜单切换（优化动画效果）
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      // 切换菜单状态
      const isHidden = mobileMenu.classList.contains('hidden');
      
      if (isHidden) {
        // 显示菜单
        mobileMenu.classList.remove('hidden');
        // 使用requestAnimationFrame确保动画正常工作
        requestAnimationFrame(() => {
          menuToggle.classList.add('active');
        });
      } else {
        // 隐藏菜单 - 添加过渡结束事件监听器
        const handleTransitionEnd = () => {
          mobileMenu.classList.add('hidden');
          mobileMenu.removeEventListener('transitionend', handleTransitionEnd);
        };
        
        mobileMenu.addEventListener('transitionend', handleTransitionEnd);
        menuToggle.classList.remove('active');
      }
    });

    // 点击移动端菜单外部关闭菜单
    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        if (!mobileMenu.classList.contains('hidden') && !mobileMenu.classList.contains('closing')) {
          // 添加关闭状态类以触发隐藏动画
          mobileMenu.classList.add('closing');
          
          const handleTransitionEnd = () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('closing');
            mobileMenu.removeEventListener('transitionend', handleTransitionEnd);
          };
          
          mobileMenu.addEventListener('transitionend', handleTransitionEnd);
          menuToggle.classList.remove('active');
        }
      }
    });
  }

  // 平滑滚动到锚点（带精确时间控制）
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // 获取导航栏高度
        const navHeight = navbar ? navbar.offsetHeight : 0;
        // 计算目标位置，减去导航栏高度和额外的偏移量
        const targetPosition = targetElement.offsetTop - navHeight - 20;
        
        // 使用自定义动画实现更精确的时间控制
        smoothScrollTo(targetPosition, 800); // 800ms动画时间
        
        // 关闭移动端菜单
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          if (menuToggle) menuToggle.classList.remove('active');
        }
      }
    });
  });

  // 滚动时元素淡入效果
  const fadeElements = document.querySelectorAll('section > div > h2');

  let ticking = false;

  function checkFade() {
    fadeElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('fade-in');
      }
    });
    ticking = false;
  }

  // 使用requestAnimationFrame优化滚动事件处理
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(checkFade);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll);
  checkFade(); // 初始化检查

  // 回到顶部按钮功能
  const backToTopButton = createBackToTopButton();
  document.body.appendChild(backToTopButton);

  // 统一处理联系方式交互
  initializeContactHandlers();
});

/**
 * 创建回到顶部按钮
 * @returns {HTMLElement} 回到顶部按钮元素
 */
function createBackToTopButton() {
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.innerHTML = '<i class="fas fa-arrow-up"></i>';
  button.setAttribute('aria-label', '回到顶部');

  let ticking = false;

  // 使用requestAnimationFrame优化滚动事件处理
  function updateButtonVisibility() {
    if (window.scrollY > 300) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
    ticking = false;
  }

  // 监听滚动事件显示/隐藏按钮
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateButtonVisibility);
      ticking = true;
    }
  });

  // 点击按钮回到顶部（使用自定义动画时间控制）
  button.addEventListener('click', () => {
    smoothScrollTo(0, 800); // 800ms动画时间
  });

  return button;
}

/**
 * 联系方式处理工具类
 */
class ContactHandler {
  /**
   * 解码Base64编码的联系方式
   * @param {string} encodedString - Base64编码的字符串
   * @returns {string} 解码后的字符串
   */
  static decodeContact(encodedString) {
    try {
      // 处理可能的URL安全Base64编码
      encodedString = encodedString.replace(/-/g, '+').replace(/_/g, '/');
      // 确保字符串长度是4的倍数
      while (encodedString.length % 4) {
        encodedString += '=';
      }
      
      // Base64解码
      if (typeof atob === 'function') {
        // 浏览器环境
        return atob(encodedString);
      } else {
        // Node.js环境（如果需要）
        return Buffer.from(encodedString, 'base64').toString('utf8');
      }
    } catch (e) {
      console.error('Base64解码失败:', e);
      throw new Error('联系方式解码失败');
    }
  }

  /**
   * HTML实体编码邮箱地址
   * @param {string} email - 邮箱地址
   * @returns {string} 编码后的HTML字符串
   */
  static encodeEmail(email) {
    let encoded = '';
    for (let i = 0; i < email.length; i++) {
      // 对@和.进行特殊编码，其他字符也进行编码以增强安全性
      const char = email[i];
      if (char === '@') {
        encoded += '&#64;';
      } else if (char === '.') {
        encoded += '&#46;';
      } else {
        encoded += '&#' + char.charCodeAt(0) + ';';
      }
    }
    return encoded;
  }

  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 是否复制成功
   */
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // 新的API
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // 回退方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          return successful;
        } catch (error) {
          console.error('回退复制方法失败:', error);
          document.body.removeChild(textArea);
          return false;
        }
      }
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  }
}

/**
 * 初始化联系方式处理函数
 */
function initializeContactHandlers() {
  // 为所有联系方式项添加点击事件查看完整信息
  const contactElements = document.querySelectorAll('[data-email], [data-phone], [data-wechat], [data-qq]');
  
  contactElements.forEach(element => {
    // 保存原始的星号隐藏文本
    const originalText = element.textContent;
    
    // 添加点击查看完整信息的功能
    element.style.cursor = 'pointer';
    element.title = '点击查看完整信息';
    
    let timeoutId = null;
    
    element.addEventListener('click', function() {
      // 清除之前的定时器
      if (timeoutId) clearTimeout(timeoutId);
      
      let fullContact = '';
      
      // 根据元素类型获取完整联系方式
      if (this.dataset.email) {
        try {
          fullContact = ContactHandler.decodeContact(this.dataset.email);
          this.textContent = fullContact;
          
          // 创建可点击的邮箱链接
          this.onclick = function() {
            window.location = 'mailto:' + fullContact;
          };
        } catch (e) {
          console.error('显示邮箱失败:', e);
          alert('邮箱显示失败，请稍后再试');
          return;
        }
      } else if (this.dataset.phone) {
        try {
          fullContact = ContactHandler.decodeContact(this.dataset.phone);
          this.textContent = fullContact;
        } catch (e) {
          console.error('显示电话失败:', e);
          alert('电话显示失败，请稍后再试');
          return;
        }
      } else if (this.dataset.qq) {
        try {
          fullContact = ContactHandler.decodeContact(this.dataset.qq);
          this.textContent = fullContact;
        } catch (e) {
          console.error('显示QQ失败:', e);
          alert('QQ显示失败，请稍后再试');
          return;
        }
      } else if (this.dataset.wechat) {
        // 微信处理逻辑 - 通常在contact.html中有特殊处理
        return;
      }
      
      // 触发显示动画
      const contactItem = this.closest('.contact-item');
      if (contactItem) {
        contactItem.classList.add('show');
      }
      
      // 为显示的联系方式添加复制按钮
      if (fullContact && !this.querySelector('.copy-btn')) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = '复制';
        
        copyBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          
          const success = await ContactHandler.copyToClipboard(fullContact);
          if (success) {
            copyBtn.textContent = '已复制';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
              copyBtn.textContent = '复制';
              copyBtn.classList.remove('copied');
            }, 2000);
          } else {
            alert('复制失败，请手动复制');
          }
        });
        
        this.appendChild(copyBtn);
      }
      
      // 20秒后重新隐藏完整信息
      timeoutId = setTimeout(function() {
        // 添加隐藏动画
        const contactItem = element.closest('.contact-item');
        if (contactItem) {
          contactItem.classList.remove('show');
          
          // 延迟恢复文本内容以匹配动画时间
          setTimeout(function() {
            // 恢复原始的星号隐藏文本
            element.textContent = originalText;
            element.title = '点击查看完整信息';
            
            // 移除邮箱的特殊点击事件，恢复默认行为
            if (element.dataset.email) {
              // 重新添加默认的点击事件
              const originalHandler = function() {
                element.click();
              };
              
              // 重新初始化点击事件
              element.onclick = null;
              // 由于事件委托问题，这里需要重新绑定
            }
          }, 300); // 与CSS过渡时间匹配
        } else {
          // 恢复原始的星号隐藏文本
          element.textContent = originalText;
          element.title = '点击查看完整信息';
          
          // 移除邮箱的特殊点击事件，恢复默认行为
          if (element.dataset.email) {
            // 重新添加默认的点击事件
            const originalHandler = function() {
              element.click();
            };
            
            // 重新初始化点击事件
            element.onclick = null;
            // 由于事件委托问题，这里需要重新绑定
          }
        }
      }, 20000);
    });
  });

  // 微信二维码弹窗处理（仅在contact.html页面有效）
  const wechatContact = document.getElementById('wechat-contact');
  if (wechatContact) {
    wechatContact.addEventListener('click', function() {
      // 添加加载动画
      const loadingSpinner = document.createElement('div');
      loadingSpinner.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70';
      loadingSpinner.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      `;
      document.body.appendChild(loadingSpinner);
      
      // 使用setTimeout模拟异步加载，实际项目中可能是图片加载或其他异步操作
      setTimeout(() => {
        // 移除加载动画
        document.body.removeChild(loadingSpinner);
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4';
        modal.id = 'wechat-qrcode-modal';
        
        // 创建模态框内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-xl overflow-hidden max-w-md w-full transform transition-all';
        
        // 创建标题
        const modalHeader = document.createElement('div');
        modalHeader.className = 'px-6 py-4 border-b flex justify-between items-center';
        modalHeader.innerHTML = '<h3 class="text-xl font-semibold">微信二维码</h3><button class="text-gray-500 hover:text-gray-700" id="close-modal"><i class="fas fa-times text-xl"></i></button>';
        
        // 创建二维码内容
        const modalBody = document.createElement('div');
        modalBody.className = 'p-6 flex flex-col items-center';
        
        let wechatId = '';
        if (wechatContact.querySelector('[data-wechat]')) {
          try {
            wechatId = ContactHandler.decodeContact(wechatContact.querySelector('[data-wechat]').dataset.wechat);
          } catch (e) {
            console.error('解码微信ID失败:', e);
            // 如果解码失败，使用默认值
            wechatId = 'di12yu34long56';
          }
        } else {
          // 如果没有data-wechat属性，使用默认值
          wechatId = 'di12yu34long56';
        }
        
        modalBody.innerHTML = `
          <p class="text-xl font-semibold mb-2 text-gray-800">微信号：${wechatId}</p>
          <img src="images/mmqrcode1759069962580.png" loading="lazy" alt="微信二维码" class="max-w-full h-auto max-h-[300px] rounded-lg shadow-md my-4" id="qrcode-image">
          <button class="mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2" id="download-qrcode">
            <i class="fas fa-download"></i>
            <span>下载二维码</span>
          </button>
        `;
        
        // 组合模态框
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 添加关闭模态框的事件
        document.getElementById('close-modal').addEventListener('click', function() {
          modal.remove();
        });
        
        // 添加点击模态框背景关闭的事件
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            modal.remove();
          }
        });
        
        // 添加下载二维码的功能
        document.getElementById('download-qrcode').addEventListener('click', function() {
          const image = document.getElementById('qrcode-image');
          if (!image) {
            alert('二维码图片未加载完成，请稍后再试');
            return;
          }
          
          // 创建临时canvas来处理图片下载
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          
          // 绘制图片到canvas
          ctx.drawImage(image, 0, 0);
          
          // 创建下载链接
          canvas.toBlob(function(blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'wechat_qrcode.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
          }, 'image/png');
        });
      }, 500); // 500ms的模拟加载时间
    });
  }
}

// 自定义平滑滚动函数，支持精确的时间控制
function smoothScrollTo(targetPosition, duration) {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  // 缓动函数（先慢后快再慢）
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

// 防抖函数
function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}