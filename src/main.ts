// import { createApp } from "vue";
// import nameplate from "./components/name.vue";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from '@tauri-apps/api/window'


// 全局变量声明区域

let roll_request_id: number;
let nameplate_doms: Array<HTMLElement>;
let btn: HTMLButtonElement;
let highlight_elem: HTMLElement;
let deltaY = 0;
const nameplate_height = 120;
const students_name_list = ["刘一","陈二","张三","李四","王五","赵六","孙七","周八","吴九","郑十"];
// resistance为阻力状态: false为无阻力自由旋转，true为有阻力减速或停止
let resistance: boolean = true;
let studentNum = 0;
let velocity: number;
let currVelocityPercent: number;
let lastFrame: number;
// 基本窗口UI框架
let always_on_top = false;

async function topwindows(btn: HTMLElement) {
    always_on_top = !always_on_top;
    if (always_on_top) {
        btn.innerHTML = '<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" id="topped-icon"><path d="M8.19092 14.5C8.56492 14.5 10.0269 13.432 11.1919 12.107C12.7449 10.342 13.6909 8.372 13.6909 6.5C13.6909 3.537 11.2559 1.5 8.19092 1.5C5.12592 1.5 2.69092 3.537 2.69092 6.5C2.69092 8.38 3.63692 10.35 5.18992 12.113C6.35392 13.435 7.81592 14.5 8.19092 14.5ZM8.19092 7.7C8.45613 7.7 8.71049 7.59464 8.89802 7.40711C9.08556 7.21957 9.19092 6.96522 9.19092 6.7C9.19092 6.43478 9.08556 6.18043 8.89802 5.99289C8.71049 5.80536 8.45613 5.7 8.19092 5.7C7.9257 5.7 7.67135 5.80536 7.48381 5.99289C7.29628 6.18043 7.19092 6.43478 7.19092 6.7C7.19092 6.96522 7.29628 7.21957 7.48381 7.40711C7.67135 7.59464 7.9257 7.7 8.19092 7.7ZM8.19092 9.9C7.34223 9.9 6.52829 9.56286 5.92818 8.96274C5.32806 8.36263 4.99092 7.54869 4.99092 6.7C4.99092 5.85131 5.32806 5.03737 5.92818 4.43726C6.52829 3.83714 7.34223 3.5 8.19092 3.5C9.03961 3.5 9.85354 3.83714 10.4537 4.43726C11.0538 5.03737 11.3909 5.85131 11.3909 6.7C11.3909 7.54869 11.0538 8.36263 10.4537 8.96274C9.85354 9.56286 9.03961 9.9 8.19092 9.9Z" fill="#000"/></svg>'
    } else {
        btn.innerHTML = '<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" id="untopped-icon"><path d="M12.6909 6.5C12.6596 5.229 12.2194 4.16917 11.3704 3.3205C10.5214 2.47183 9.46158 2.03167 8.19092 2C6.91992 2.03133 5.86008 2.4715 5.01142 3.3205C4.16275 4.1695 3.72258 5.22933 3.69092 6.5C3.69092 7.427 4.06325 8.48683 4.80792 9.6795C5.55258 10.8722 6.68025 12.1925 8.19092 13.6405C9.70125 12.1925 10.8289 10.8722 11.5739 9.6795C12.3189 8.48683 12.6913 7.427 12.6909 6.5ZM8.19092 15C4.52425 11.6667 2.69092 8.83333 2.69092 6.5C2.73258 4.93733 3.26908 3.6405 4.30042 2.6095C5.33175 1.5785 6.62858 1.042 8.19092 1C9.75358 1.04167 11.0504 1.57817 12.0814 2.6095C13.1124 3.64083 13.6489 4.93767 13.6909 6.5C13.6909 8.83333 11.8576 11.6667 8.19092 15ZM8.19092 8C8.61792 7.98967 8.97208 7.84383 9.25342 7.5625C9.53475 7.28117 9.67542 6.927 9.67542 6.5C9.67542 6.073 9.53475 5.71883 9.25342 5.4375C8.97208 5.15617 8.61792 5.0155 8.19092 5.0155C7.76392 5.0155 7.40975 5.15617 7.12842 5.4375C6.84708 5.71883 6.70642 6.073 6.70642 6.5C6.70642 6.927 6.84708 7.28117 7.12842 7.5625C7.40975 7.84383 7.76392 7.98967 8.19092 8ZM8.19092 9C7.48258 8.979 6.89408 8.73417 6.42542 8.2655C5.95675 7.79683 5.71192 7.20833 5.69092 6.5C5.71192 5.79167 5.95675 5.20317 6.42542 4.7345C6.89408 4.26583 7.48258 4.021 8.19092 4C8.89925 4.021 9.48775 4.26583 9.95642 4.7345C10.4251 5.20317 10.6699 5.79167 10.6909 6.5C10.6699 7.20833 10.4251 7.79683 9.95642 8.2655C9.48775 8.73417 8.89925 8.979 8.19092 9Z" fill="#000"/></svg>'
    }
    await invoke('set_window_always_on_top', { data: always_on_top }); // 处理后端代码返回的响应
}

function disableContextMenu() {
    // 禁止右键菜单
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
}

// 对标题栏的按钮增加控制
window.addEventListener("DOMContentLoaded", async () => {
    // 窗口初始化，屏蔽右键
    disableContextMenu();

    // 标题栏初始化
    // ?.符号，先判断?前面的对象是否存在，若存在，再执行后面的方法
    document.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close())
    document.getElementById('titlebar-minimize')?.addEventListener('click', () => appWindow.minimize())

    let top_btn = document.getElementById('titlebar-always-on-top')
    top_btn?.addEventListener('click', () => topwindows(top_btn))

    // DOM的声明
    if (document.getElementById("btn") !== null) {
        btn = document.getElementById("btn")! as HTMLButtonElement;
    }
    nameplate_doms = Array.from(document.querySelectorAll('.studentName'))
    if (document.getElementById("highlight") !== null) {
        highlight_elem = document.getElementById("highlight")!;
    }

    // 姓名版初始化
    modifyName();

    // “开始”按钮初始化
    const currStatus = ["停", "开始"]

    // 音频初始化
    const roll_audio = document.getElementById('audio1') as HTMLAudioElement;

    btn.addEventListener("click", function () {
        if (resistance) {
            // 音效
            roll_audio.currentTime = 0;
            roll_audio.play();
            // 动画
            lastFrame = Date.now();
            roll_request_id = requestAnimationFrame(animate);
        }
        else {
            // 音效
            roll_audio.pause();
        }
        resistance = !resistance;
        btn.innerText = currStatus[Number(resistance)]
    })
});

function modifyName() {
    // 姓名板上姓名的切换
    for (let i = 0; i < nameplate_doms.length; i++) {
        nameplate_doms[i].innerText = students_name_list[(studentNum + i) % (students_name_list.length)]
    }
    if (studentNum >= students_name_list.length) {
        studentNum = 0;
    }
    studentNum += 1;
}

function animate() {
    velocity = 1.25 * (Date.now() - lastFrame);
    lastFrame = Date.now()
    deltaY += velocity;
    if (deltaY >= nameplate_height) {
        deltaY -= nameplate_height;
        modifyName();
    }
    for (const e of nameplate_doms) {
        e.style.setProperty("bottom", String(deltaY + "px"))
    }

    // 下一个动画
    if (resistance) {
        currVelocityPercent = 1;
        btn.disabled = true
        roll_request_id = requestAnimationFrame(stopAnimate);
    }
    else {
        roll_request_id = requestAnimationFrame(animate);
    }
}

function stopAnimate() {
    // 减速系数
    const deceleration = 0.96;
    // 停止阈值
    const stopThreshold = 0.1;

    velocity = 1.2 * (Date.now() - lastFrame);
    lastFrame = Date.now()
    // 减速
    currVelocityPercent *= deceleration;

    // 更新 deltaY
    deltaY += currVelocityPercent * velocity;

    // 确保 deltaY 始终为正，并在 0 到 nameplate_height 之间
    if (deltaY >= nameplate_height) {
        deltaY -= nameplate_height;
        modifyName();
    }

    // 更新所有 nameplate 的位置
    for (const e of nameplate_doms) {
        e.style.setProperty("bottom", `${deltaY}px`);
    }

    // 如果速度足够小，停止动画
    if (Math.abs(currVelocityPercent * velocity) < stopThreshold) {
        // 缓慢调整到最近的整数倍 nameplate_height
        let targetDelta = Math.round(deltaY / nameplate_height) * nameplate_height;
        // console.log(targetDelta)
        let adjustmentSpeed = (targetDelta - deltaY) * 0.1;

        if (Math.abs(adjustmentSpeed) < 0.01) {
            // 最终对齐
            highlight_elem.style.animation = "highlightAnimation 0.3s 10";
            setTimeout(() => {
                highlight_elem.style.removeProperty('animation')
                btn.disabled = false
            }, 2000)// 禁用2秒
            deltaY = targetDelta;
            for (const e of nameplate_doms) {
                e.style.setProperty("bottom", `${deltaY}px`);
            }
            cancelAnimationFrame(roll_request_id);
        } else {
            // 继续微调
            deltaY += adjustmentSpeed;
            roll_request_id = requestAnimationFrame(stopAnimate);
        }
    } else {
        // 继续减速
        roll_request_id = requestAnimationFrame(stopAnimate);
    }
}
