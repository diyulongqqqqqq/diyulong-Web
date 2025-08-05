// 导航栏滚动效果
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 移动端菜单切换
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// 关闭移动端菜单当点击链接时
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// 照片轮播功能 - 仅在作品集页面执行
if (document.getElementById('slider')) {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sliderDots = document.getElementById('sliderDots');
    let currentSlide = 0;
    let slideInterval;

    // 设置轮播图片背景
    slides.forEach(slide => {
        const imgUrl = slide.getAttribute('data-img');
        slide.style.backgroundImage = `url('${imgUrl}')`;
    });

    // 创建轮播指示器
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => goToSlide(index));
        sliderDots.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    // 显示指定幻灯片
    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        currentSlide = (index + slides.length) % slides.length;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    // 下一张幻灯片
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    // 上一张幻灯片
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // 开始自动轮播
    function startSlideInterval() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // 停止自动轮播
    function stopSlideInterval() {
        clearInterval(slideInterval);
    }

    // 按钮事件监听
    prevBtn.addEventListener('click', () => {
        stopSlideInterval();
        prevSlide();
        startSlideInterval();
    });

    nextBtn.addEventListener('click', () => {
        stopSlideInterval();
        nextSlide();
        startSlideInterval();
    });

    // 鼠标悬停时停止轮播
    const slider = document.getElementById('slider');
    slider.addEventListener('mouseenter', stopSlideInterval);
    slider.addEventListener('mouseleave', startSlideInterval);

    // 初始化轮播
    startSlideInterval();
}

// 页面元素淡入效果
const fadeElements = document.querySelectorAll('.about, .portfolio, .contact-form');

// 添加弹窗逻辑
window.addEventListener('load', function() {
    const modal = document.getElementById('notification-modal');
    const closeBtn = document.querySelector('.close-btn');
    const dontShowAgain = document.getElementById('dont-show-again');
    const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
    const lastClosed = localStorage.getItem('notificationModalClosed');
    const now = Date.now();

    // 检查弹窗是否已被关闭且在7天内
    if (!lastClosed || now - parseInt(lastClosed) > WEEK_IN_MS) {
        // 显示弹窗
        setTimeout(function() {
            modal.style.display = 'block';
        }, 500); // 延迟500ms显示，确保页面已完全加载
    }

    // 关闭弹窗功能
    function closeModal() {
        modal.style.display = 'none';
        // 只有在勾选复选框时才设置7天内不再显示
        if (dontShowAgain.checked) {
            localStorage.setItem('notificationModalClosed', now.toString());
        }
    }

    // 点击关闭按钮
    closeBtn.addEventListener('click', closeModal);

    // 点击弹窗外部区域
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});

function checkFade() {
    fadeElements.forEach(element => {
        if (element) {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);

            if (isVisible) {
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        }
    });
}

// 初始设置
fadeElements.forEach(element => {
    if (element) {
        element.style.opacity = 0;
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    }
});

// 检查元素是否在视口中
window.addEventListener('scroll', checkFade);
window.addEventListener('load', checkFade);

// Cloudflare Turnstile验证逻辑
// 仅保留联系方式验证相关代码
document.addEventListener('DOMContentLoaded', function() {
    const verifyButton = document.getElementById('verify-captcha');
    const captchaContainer = document.getElementById('captcha-container');
    const protectedEmail = document.getElementById('protected-email');
    const protectedPhone = document.getElementById('protected-phone');
    const successMessage = document.getElementById('success-message');
    const contactForm = document.getElementById('contactForm');

    // 加密的联系方式
    const encryptedEmail = 'MTczNTAzOTA5MkBxcS5jb20='; // 您的邮箱Base64加密值
    const encryptedPhone = 'MTQ3MDQ2NjYzNTY='; // 您的电话Base64加密值

    // 验证按钮点击事件（用于查看联系方式）
    if (verifyButton) {
        verifyButton.addEventListener('click', function() {
            if (!checkRequestFrequency()) {
                return;
            }

            // 获取验证码响应
            const token = window.turnstile.getResponse();

            if (!token) {
                alert('请先完成验证码');
                return;
            }

            // 模拟后端验证
            // 由于没有实际的后端验证服务，这里直接假设验证成功
            const isValid = true;
            
            if (isValid) {
                // 解密并显示联系方式
                const email = atob(encryptedEmail);
                const phone = atob(encryptedPhone);

                protectedEmail.innerHTML = `<a href="mailto:${email}">${email}</a>`;
                protectedPhone.innerHTML = `<a href="tel:${phone}">${phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</a>`;
                protectedEmail.classList.remove('protected');
                protectedPhone.classList.remove('protected');
                successMessage.style.display = 'block';
                verifyButton.style.display = 'none';
                captchaContainer.style.display = 'none';

                // 5秒后隐藏成功消息
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            } else {
                alert('验证码验证失败，请重试');
                // 重置Turnstile
                window.turnstile.reset();
            }
        });
    }
    // 表单提交处理
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 获取表单数据
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            // 获取验证码响应
            const token = window.turnstile.getResponse();

            if (!token) {
                alert('请先完成验证码');
                return;
            }

            // 显示加载状态
            const submitButton = contactForm.querySelector('.btn-submit');
            submitButton.textContent = '发送中...';
            submitButton.disabled = true;

            // 模拟后端验证和表单提交
            simulateBackendVerification(token)
                .then(isValid => {
                    if (isValid) {
                        // 这里可以添加表单数据发送到后端的逻辑
                        // 例如使用fetch发送到您的服务器
                        fetch('https://your-backend-api.com/send-message', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({name, phone, message})
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // 显示成功消息
                                successMessage.textContent = '消息发送成功！我会尽快回复您。';
                                successMessage.style.display = 'block';

                                // 重置表单
                                contactForm.reset();

                                // 重置验证码
                                window.turnstile.reset();
                            } else {
                                alert('消息发送失败: ' + data.error);
                            }
                        })
                        .catch(error => {
                            console.error('提交表单时出错:', error);
                            alert('消息发送失败，请稍后重试。');
                        });
                    } else {
                        alert('验证码验证失败，请重试。');
                        // 重置Turnstile
                        window.turnstile.reset();
                    }
                })
                .catch(error => {
                    console.error('提交表单时出错:', error);
                    alert('消息发送失败，请稍后重试。');
                })
                .finally(() => {
                    // 恢复按钮状态
                    submitButton.textContent = '发送消息';
                    submitButton.disabled = false;

                    // 5秒后隐藏成功消息
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 5000);
                });
        });
    }

    // 模拟后端验证函数
    function simulateBackendVerification(token) {
        // 实际应用中，这里应该发送 token 到您的后端服务器
        // 并使用 Cloudflare 提供的秘密密钥进行验证
        // 这里为了演示，我们简单地返回一个成功的 Promise
        return new Promise(resolve => {
            // 模拟网络延迟
            setTimeout(() => {
                resolve(true); // 假设验证总是成功
            }, 500);
        });
    }
});

// 使用更安全的加密方式 (示例使用简单异或加密，实际应使用专业加密库)
const encryptedEmail = 'e84d1a5c7b3f9e0a2d4c6b8a0f2e4d6c'; // 加密后的邮箱
// 加密的联系方式（使用时间戳加盐）
const encryptedPhone = 'e84d1a5c7b3f9e0a2d4c6b8a0f2e4d6c'; // 后端生成的带时间戳的加密值
const encryptionKey = 'dynamic-key-based-on-timestamp'; // 基于时间的动态密钥

// 解密函数（增加时间验证）
function decryptPhone(data, key) {
    // 验证时间戳是否在有效期内
    const timestamp = parseInt(data.substr(0, 8), 16);
    const now = Math.floor(Date.now() / 1000);
    
    // 只允许5分钟内的加密值有效
    if (now - timestamp > 300) {
        return '手机号已过期，请重新验证';
    }
    
    // 解密逻辑
    let result = '';
    for (let i = 8; i < data.length; i += 2) {
        const keyChar = key.charCodeAt((i-8) % key.length);
        const dataChar = parseInt(data.substr(i, 2), 16);
        result += String.fromCharCode(dataChar ^ keyChar);
    }
    return result;
}

// 临时添加isValid全局变量定义以解决引用错误
let isValid = false;
// 已移除使用isValid的示例代码块，因为isValid在此上下文中未定义
// 验证成功后调用后端API获取手机号
function logAccessEvent(eventType, details) {
    // 收集访问信息
    const accessInfo = {
        eventType: eventType,
        timestamp: new Date().toISOString(),
        ip: 'unknown', // 实际IP需要从后端获取
        deviceId: getDeviceId(),
        userAgent: navigator.userAgent,
        details: details
    };

    // 发送到后端审计API
    fetch('/api/log-access', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(accessInfo)
    }).catch(error => {
        console.error('记录访问日志失败:', error);
    });
}

function getPhoneNumber() {
    // 记录请求手机号事件
    logAccessEvent('PHONE_REQUEST', {
        action: '请求手机号',
        status: '开始'
    });

    fetch('/api/get-phone', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token: 'user-authentication-token'})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 显示手机号
            protectedPhone.innerHTML = `<a href="tel:${data.phone}">${data.phone}</a>`;
            protectedPhone.classList.remove('protected');

            // 记录成功获取手机号事件
            logAccessEvent('PHONE_ACCESS', {
                action: '获取手机号成功',
                phone: data.phone
            });
        } else {
            // 记录失败事件
            logAccessEvent('PHONE_ACCESS_FAILED', {
                action: '获取手机号失败',
                reason: data.error || '未知错误'
            });
        }
    })
    .catch(error => {
        console.error('获取手机号失败:', error);
        // 记录异常事件
        logAccessEvent('PHONE_ACCESS_ERROR', {
            action: '获取手机号异常',
            error: error.message
        });
    });
}

function hidePhoneNumber() {
    protectedPhone.innerHTML = '手机号已隐藏，需要重新验证';
    protectedPhone.classList.add('protected');
    localStorage.removeItem('phoneDisplayTime');
}
// 在验证成功后调用 (已注释，因为isValid在此上下文中未定义)
// if (isValid) {
//     getPhoneNumber(); // 替换原来的解密逻辑
// }

// 添加请求频率限制
// 添加请求频率限制
const REQUEST_INTERVAL = 60000; // 1分钟限制
const MAX_DAILY_REQUESTS = 5; // 每日最大请求次数

// 获取或生成设备标识符
function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

// 检查请求频率
function checkRequestFrequency() {
    const now = Date.now();
    const deviceId = getDeviceId();
    const lastRequestTime = localStorage.getItem(`lastRequestTime_${deviceId}`) || 0;
    const requestCount = parseInt(localStorage.getItem(`requestCount_${deviceId}`) || '0');
    const today = new Date().toDateString();
    const lastRequestDate = localStorage.getItem(`lastRequestDate_${deviceId}`) || '';

    // 如果日期不同，重置请求计数
    if (lastRequestDate !== today) {
        localStorage.setItem(`requestCount_${deviceId}`, '0');
        localStorage.setItem(`lastRequestDate_${deviceId}`, today);
        return true;
    }

    // 检查请求次数是否超过限制
    if (requestCount >= MAX_DAILY_REQUESTS) {
        alert('今日请求次数已达上限，请明日再试。');
        return false;
    }

    // 检查请求间隔
    if (now - parseInt(lastRequestTime) < REQUEST_INTERVAL) {
        alert('请求过于频繁，请稍后再试。');
        return false;
    }

    // 更新请求记录
    localStorage.setItem(`lastRequestTime_${deviceId}`, now.toString());
    localStorage.setItem(`requestCount_${deviceId}`, (requestCount + 1).toString());
    return true;
}

// 验证按钮点击事件已在DOMContentLoaded中定义
// 此处为重复代码，已移除

// 版本标识: v2 - 解决isValid未定义错误