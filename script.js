// 导航栏滚动效果
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('bg-white/95', 'backdrop-blur-sm', 'shadow-lg');
    navbar.classList.remove('bg-transparent');
    // 文字颜色变深
    navbar.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('text-gray-300');
      link.classList.add('text-gray-800');
    });
  } else {
    navbar.classList.remove('bg-white/95', 'backdrop-blur-sm', 'shadow-lg');
    navbar.classList.add('bg-transparent');
    // 文字颜色变浅
    navbar.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('text-gray-800');
      link.classList.add('text-gray-300');
    });
  }
});

// 移动端菜单切换
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  menuToggle.classList.toggle('active');
});

// 平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      // 获取导航栏高度
      const navHeight = navbar.offsetHeight;
      // 计算目标位置，减去导航栏高度和额外的偏移量
      const targetPosition = targetElement.offsetTop - navHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // 关闭移动端菜单
      if (!mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        menuToggle.classList.remove('active');
      }
    }
  });
});

// 滚动时元素淡入效果
const fadeElements = document.querySelectorAll('section > div > h2');

function checkFade() {
  fadeElements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add('fade-in');
    }
  });
}

window.addEventListener('scroll', checkFade);
checkFade(); // 初始化检查


// 公共联系方式处理函数

/**
 * 解码Base64编码的联系方式
 * @param {string} encodedString - Base64编码的字符串
 * @returns {string} 解码后的字符串
 */
function decodeContact(encodedString) {
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
function encodeEmail(email) {
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
 * 在模态框中显示完整联系方式
 * @param {boolean} useModalContent - 是否使用模态框内容区域显示完整联系方式
 */
function showFullContactInfoInModal(useModalContent = false) {
  if (useModalContent) {
    // 显示在通用模态框内容区域
    const contentElement = document.getElementById('modal-contact-content');
    const showBtn = document.getElementById('show-contact-btn');
    const hideBtn = document.getElementById('hide-contact-btn');
    
    // 尝试从页面元素中获取编码的联系方式
    const contactElement = document.querySelector('[data-email], #modal-email-display');
    let fullEmail = '';
    let fullPhone = '';
    
    try {
      if (contactElement && contactElement.dataset.email) {
        // 使用data-email属性解码获取邮箱
        fullEmail = decodeContact(contactElement.dataset.email);
      } else if (contactElement && contactElement.dataset.emailPart1 && contactElement.dataset.emailPart2) {
        // 或者使用data-email-part属性拼接获取邮箱
        fullEmail = contactElement.dataset.emailPart1 + '@' + contactElement.dataset.emailPart2;
      }
      
      // 尝试获取电话号码
      const phoneElement = document.querySelector('[data-phone], #modal-phone-display');
      if (phoneElement && phoneElement.dataset.phone) {
        // 使用data-phone属性解码获取电话
        fullPhone = decodeContact(phoneElement.dataset.phone);
      }
      
      // 设置联系方式内容
      let contentHtml = '';
      if (fullEmail) {
        contentHtml += `
          <div class="p-4 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-700 mb-2">完整邮箱地址</h4>
            <p class="text-lg font-semibold">${encodeEmail(fullEmail)}</p>
          </div>`;
      }
      if (fullPhone) {
        contentHtml += `
          <div class="p-4 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-700 mb-2">完整电话号码</h4>
            <p class="text-lg font-semibold">${fullPhone}</p>
          </div>`;
      }
      
      if (contentHtml) {
        contentElement.innerHTML = `<div class="space-y-4">${contentHtml}</div>`;
      } else {
        contentElement.innerHTML = '<p class="text-gray-500 text-center">无法加载联系方式，请稍后再试</p>';
      }
    } catch (e) {
      console.error('显示联系方式失败:', e);
      contentElement.innerHTML = '<p class="text-gray-500 text-center">无法加载联系方式，请稍后再试</p>';
    }
    
    // 切换按钮显示状态
    if (showBtn) showBtn.classList.add('hidden');
    if (hideBtn) hideBtn.classList.remove('hidden');
  } else {
    // 在弹窗中显示单个联系方式
    const modalEmailDisplay = document.getElementById('modal-email-display');
    const modalPhoneDisplay = document.getElementById('modal-phone-display');
    const showBtn = document.getElementById('show-contact-btn');
    const hideBtn = document.getElementById('hide-contact-btn');
    
    // 显示完整邮箱联系方式
    if (modalEmailDisplay) {
      try {
        let email = '';
        if (modalEmailDisplay.dataset.email) {
          // 使用data-email属性解码获取邮箱
          email = decodeContact(modalEmailDisplay.dataset.email);
        } else if (modalEmailDisplay.dataset.emailPart1 && modalEmailDisplay.dataset.emailPart2) {
          // 或者使用data-email-part属性拼接获取邮箱
          email = modalEmailDisplay.dataset.emailPart1 + '@' + modalEmailDisplay.dataset.emailPart2;
        }
        
        if (email) {
          // 使用HTML实体编码邮箱
          const encodedEmail = encodeEmail(email);
          modalEmailDisplay.innerHTML = encodedEmail;
          // 创建可点击的邮箱链接
          modalEmailDisplay.style.cursor = 'pointer';
          // 不设置特定颜色，使用与隐藏状态相同的样式
          modalEmailDisplay.onclick = function() {
            window.location.href = 'mailto:' + email;
          };
        }
      } catch (e) {
        console.error('显示邮箱失败:', e);
      }
    }
    
    // 显示完整电话联系方式
    if (modalPhoneDisplay) {
      try {
        let phone = '';
        if (modalPhoneDisplay.dataset.phone) {
          // 使用data-phone属性解码获取电话
          phone = decodeContact(modalPhoneDisplay.dataset.phone);
        }
        
        if (phone) {
          // 直接显示完整电话号码
          modalPhoneDisplay.textContent = phone;
          // 不设置特定颜色，使用与隐藏状态相同的样式
        }
      } catch (e) {
        console.error('显示电话失败:', e);
      }
    }
    
    // 切换按钮显示状态
    if (showBtn) showBtn.classList.add('hidden');
    if (hideBtn) hideBtn.classList.remove('hidden');
  }
}

/**
 * 在模态框中隐藏完整联系方式
 * @param {boolean} useModalContent - 是否使用模态框内容区域隐藏完整联系方式
 */
function hideFullContactInfoInModal(useModalContent = false) {
  if (useModalContent) {
    // 隐藏通用模态框内容区域的联系方式
    const contentElement = document.getElementById('modal-contact-content');
    const showBtn = document.getElementById('show-contact-btn');
    const hideBtn = document.getElementById('hide-contact-btn');
    
    // 清空联系方式内容
    contentElement.innerHTML = '<p class="text-gray-500 text-center">点击"显示联系方式"按钮查看完整信息</p>';
    
    // 切换按钮显示状态
    if (showBtn) showBtn.classList.remove('hidden');
    if (hideBtn) hideBtn.classList.add('hidden');
  } else {
    // 在弹窗中隐藏单个联系方式
    const modalEmailDisplay = document.getElementById('modal-email-display');
    const modalPhoneDisplay = document.getElementById('modal-phone-display');
    const showBtn = document.getElementById('show-contact-btn');
    const hideBtn = document.getElementById('hide-contact-btn');
    
    // 恢复脱敏显示
    if (modalEmailDisplay) {
      modalEmailDisplay.textContent = '173*****92@qq.com';
      modalEmailDisplay.style.cursor = 'default';
      modalEmailDisplay.style.color = '';
      modalEmailDisplay.onclick = null;
    }
    
    if (modalPhoneDisplay) {
      modalPhoneDisplay.textContent = '147****6356';
    }
    
    // 切换按钮显示状态
    if (showBtn) showBtn.classList.remove('hidden');
    if (hideBtn) hideBtn.classList.add('hidden');
  }
}