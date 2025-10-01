// 安全工具类 - 静态部署版本
// 注意：此文件包含前端安全功能，适用于静态网站部署环境。
window.securityUtils = {
  // 初始化安全检查
  initSecurityChecks: function() {
    console.log('安全检查已初始化');
    
    // 设置基本的安全参数
    this.setupSecurityParameters();
    
    // 初始化点击跟踪
    this.initClickTracking();
    
    // 添加页面退出前的安全检查
    this.addBeforeUnloadCheck();
    
    // 初始化联系方式保护措施
    this.initContactProtection();
  },
  
  // 设置安全参数
  setupSecurityParameters: function() {
    // 防止XSS攻击的内容安全策略
    if (document.querySelector('meta[http-equiv="Content-Security-Policy"]') === null) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://formspree.io; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;");
      document.head.appendChild(cspMeta);
    }
    
    // 防止MIME类型嗅探
    if (document.querySelector('meta[http-equiv="X-Content-Type-Options"]') === null) {
      const xContentTypeMeta = document.createElement('meta');
      xContentTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
      xContentTypeMeta.setAttribute('content', 'nosniff');
      document.head.appendChild(xContentTypeMeta);
    }
    
    // 注意：在静态部署环境中，X-Frame-Options等安全头需要通过托管平台的配置实现
    // 如GitHub Pages、Netlify、Vercel等平台提供的自定义HTTP头设置功能
  },
  
  // 初始化点击跟踪
  initClickTracking: function() {
    // 记录点击次数
    let clickCount = 0;
    const maxClickCount = 30; // 限制在短时间内的最大点击次数
    const clickTimeWindow = 10000; // 时间窗口（毫秒）
    const clickTimestamps = [];
    
    document.addEventListener('click', function() {
      clickCount++;
      const now = Date.now();
      clickTimestamps.push(now);
      
      // 清理过期的时间戳
      const filteredTimestamps = clickTimestamps.filter(timestamp => now - timestamp < clickTimeWindow);
      clickTimestamps.length = 0;
      filteredTimestamps.forEach(ts => clickTimestamps.push(ts));
      
      // 检测异常点击行为
      if (clickTimestamps.length > maxClickCount) {
        console.warn('检测到异常点击行为');
        // 可以在这里添加警告或阻止行为
      }
    });
  },
  
  // 添加页面退出前的检查
  addBeforeUnloadCheck: function() {
    // 可以在这里添加页面退出前的安全检查
  },
  
  // 验证ID生成器
  generateVerificationId: function() {
    // 生成随机的验证ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let verificationId = '';
    for (let i = 0; i < 32; i++) {
      verificationId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return verificationId;
  },
  
  // 初始化联系方式保护措施
  initContactProtection: function() {
    // 检查是否为爬虫User-Agent
    const isBot = this.isBotUserAgent();
    
    if (isBot) {
      // 隐藏所有联系方式
      this.hideContactInformation();
    } else {
      // 为邮箱和电话添加保护措施
      this.protectEmailAddresses();
      this.protectPhoneNumbers();
    }
  },
  
  // 检查是否为爬虫User-Agent
  isBotUserAgent: function() {
    const userAgent = navigator.userAgent.toLowerCase();
    const botKeywords = [
      'bot', 'crawler', 'spider', 'crawling', 'slurp', 'mediapartners', 
      'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider',
      'mj12bot', 'ahrefsbot', 'semrushbot', 'rogerbot', 'exabot',
      'scanner', 'analyzer', 'webbot', 'feedfetcher', 'mail.ru'
    ];
    
    return botKeywords.some(keyword => userAgent.includes(keyword));
  },
  
  // 隐藏所有联系方式
  hideContactInformation: function() {
    const contactElements = document.querySelectorAll('.contact-item, .contact-info, .email, .phone, #email-display, #phone-display');
    contactElements.forEach(el => {
      el.style.display = 'none';
    });
  },
  
  // 保护邮箱地址 - 使用JS动态拼接和HTML实体编码
  protectEmailAddresses: function() {
    // 查找所有需要保护的邮箱元素
    const emailElements = document.querySelectorAll('#email-display, #modal-email-display, [data-email], [data-email-part1], .email');
    
    emailElements.forEach(el => {
      // 检查是否有email属性（Base64编码）
      const encodedEmail = el.getAttribute('data-email');
      if (encodedEmail) {
        // 使用Base64解码
        try {
          const decodedEmail = this.decodeContact(encodedEmail);
          const encodedHtml = this.encodeEmail(decodedEmail);
          el.innerHTML = encodedHtml;
          el.setAttribute('href', 'mailto:' + decodedEmail);
        } catch (e) {
          console.error('解码邮箱失败:', e);
        }
      } else {
        // 检查是否有email-part属性
        const part1 = el.getAttribute('data-email-part1');
        const part2 = el.getAttribute('data-email-part2');
        
        if (part1 && part2) {
          // 使用HTML实体编码动态拼接邮箱
          const email = this.encodeEmail(part1 + '@' + part2);
          el.innerHTML = email;
          el.setAttribute('href', 'mailto:' + part1 + '@' + part2);
        }
      }
    });
  },
  
  // 保护电话号码 - 使用SVG图片显示
  protectPhoneNumbers: function() {
    const phoneElements = document.querySelectorAll('#phone-display, #modal-phone-display, [data-phone], .phone');
    
    phoneElements.forEach(el => {
      // 检查是否有data-phone属性（Base64编码）
      const encodedPhone = el.getAttribute('data-phone');
      if (encodedPhone) {
        // 使用Base64解码
        try {
          const decodedPhone = this.decodeContact(encodedPhone);
          // 替换为SVG图片
          if (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'span') {
            // 创建SVG图片容器
            const svgContainer = document.createElement('span');
            svgContainer.innerHTML = `<img src="phone-number.svg" alt="电话号码" class="phone-svg" />`;
            
            // 保存原始文本和解码后的文本作为数据属性
            svgContainer.setAttribute('data-original-text', el.textContent);
            svgContainer.setAttribute('data-decoded-text', decodedPhone);
            
            // 替换原始元素内容
            el.innerHTML = '';
            el.appendChild(svgContainer);
          }
        } catch (e) {
          console.error('解码电话失败:', e);
        }
      } else {
        // 替换为SVG图片
        if (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'span') {
          // 创建SVG图片容器
          const svgContainer = document.createElement('span');
          svgContainer.innerHTML = `<img src="phone-number.svg" alt="电话号码" class="phone-svg" />`;
          
          // 保存原始文本作为数据属性
          svgContainer.setAttribute('data-original-text', el.textContent);
          
          // 替换原始元素内容
          el.innerHTML = '';
          el.appendChild(svgContainer);
        }
      }
    });
  },
  
  // HTML实体编码邮箱地址
  encodeEmail: function(email) {
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
  },
  
  // 解码Base64编码的联系方式
  decodeContact: function(encodedString) {
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
  },
  
  // 创建Formspree表单
  createFormspreeForm: function(containerId, encodedEmail) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
      // 解码Base64编码的邮箱
      const email = this.decodeContact(encodedEmail);
      const encodedHtml = this.encodeEmail(email);
      
      // 创建Formspree表单
      container.innerHTML = `
        <form action="https://formspree.io/f/${email.split('@')[0]}" method="POST" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">您的姓名</label>
            <input type="text" id="name" name="name" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" required>
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">您的邮箱</label>
            <input type="email" id="email" name="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" required>
          </div>
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-1">您的留言</label>
            <textarea id="message" name="message" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" required></textarea>
          </div>
          <div class="text-center">
            <button type="submit" class="btn-primary px-6 py-3 rounded-lg text-white font-semibold hover:bg-primary/90 transition-colors">发送消息</button>
          </div>
        </form>
      `;
    } catch (e) {
      console.error('创建表单失败:', e);
      container.innerHTML = '<p class="text-red-500 text-center">表单加载失败，请稍后再试</p>';
    }
  }
};





// 联系方式相关函数
// 注意：showFullContactInfoInModal和hideFullContactInfoInModal函数已移至script.js中，此处不再重复定义

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化安全工具
  if (window.securityUtils && window.securityUtils.initSecurityChecks) {
    window.securityUtils.initSecurityChecks();
  }
});