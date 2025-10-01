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