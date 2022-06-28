import { createId } from "../../utils";
import styles from "./index.module.less";

export interface MenuOption {
  title: string;
  id?: string;
  click?(event: MouseEvent): void;
}

export interface MenuOperationInterface {
  /**
   * 是否已经显示
   */
  isShow(): boolean;
  /**
   *
   * @param x x坐标
   * @param y y坐标
   * @param ele 要附加到的元素
   */
  show(x: number, y: number, ele?: HTMLElement): void;
  /**
   * 显示选项
   * @param ids 要显示的列表
   */
  showOption(...ids: string[]): void;
  /**
   * 隐藏菜单
   */
  hide(): void;
  /**
   * 隐藏选项
   * @param id 选项Id
   */
  hideOption(...id: string[]): void;
  /**
   * 销毁菜单
   */
  destory(): void;
  /**
   * 添加菜单选项
   * @param menuOption 菜单选项
   */
  appendMenuOption(...menuOption: MenuOption[]): void;
  /**
   * 根据菜单选项ID删除菜单
   * @param id 要删除的ID
   */
  removeMenuOption(...id: string[]): void;
  /**
   * 设置默认单击事件
   * @param event 事件信息
   */
  setDefaultClickEvent(fn: (event: MouseEvent) => void): void;
}

export class MenuOperationImpl implements MenuOperationInterface {
  /**
   * 是否已被销毁
   */
  private _destory = false;

  /**
   * 菜单ID
   */
  private _menuId = createId();

  /**
   * 菜单元素
   */
  private _menuEle = document.createElement("div");

  /**
   * 默认单击事件
   */
  private _defaultClick: (event: MouseEvent) => void | undefined;

  /**
   * 销毁监测
   */
  private _destoryCheck() {
    if (this._destory) {
      throw new Error("菜单已被销毁, 无法使用");
    }
  }

  /**
   * 拼接id
   * @param id id
   * @returns 拼接完成的id
   */
  private _joinId(id: string): string {
    id = this._menuId + "_" + id;
    id = id.replace(/\./gi, "");
    return "_" + id;
  }

  private _documentClickHide(event: MouseEvent) {
    document.removeEventListener("mousedown", this._documentClickHide);
    const ele = event.target as HTMLElement;
    if (ele.className.includes(styles.option)) {
      (ele as any)._onclick(event);
      return;
    }
    this.hide();
    if (this._defaultClick) {
      this._defaultClick(event);
    }
  }

  public constructor() {
    this._menuEle.className = styles.menu;
    this._menuEle.style.display = "none";
    this.hide = this.hide.bind(this);
    this._documentClickHide = this._documentClickHide.bind(this);
  }

  /**
   * 显示菜单
   * @param x x坐标
   * @param y y坐标
   * @param ele 要显示道德元素
   */
  public show(x: number, y: number, ele?: HTMLElement) {
    this._destoryCheck();
    ele = ele || document.body;
    if (this._menuEle.parentElement !== ele) {
      ele.appendChild(this._menuEle);
    }
    this._menuEle.style.top = y + "px";
    this._menuEle.style.left = x + "px";
    this._menuEle.style.display = "block";
    document.addEventListener("mousedown", this._documentClickHide);
  }

  /**
   * 隐藏菜单
   */
  public hide(): void {
    this._destoryCheck();
    this._menuEle.style.display = "none";
  }

  /**
   * 销毁菜单
   */
  destory(): void {
    if (this._destory) {
      return;
    }
    this.hide();
    this._menuEle.remove();
    delete this._menuEle;
  }

  /**
   * 添加菜单选项
   * @param menuOption 菜单元素
   */
  public appendMenuOption(...menuOption: MenuOption[]): void {
    if (menuOption.length === 0) {
      return;
    }
    this._destoryCheck();
    for (let i = 0; i < menuOption.length; i++) {
      const option = menuOption[i];
      const optionEle = document.createElement("div");
      optionEle.className = styles.option;
      optionEle.innerText = option.title;
      if (option.id) {
        optionEle.id = this._joinId(option.id);
      }
      (optionEle as any)._onclick = (event) => {
        event.stopImmediatePropagation && event.stopImmediatePropagation();
        event.stopPropagation && event.stopPropagation();
        this.hide();
        if (option.click) {
          option.click(event);
        }
      };
      this._menuEle.appendChild(optionEle);
    }
  }

  /**
   * 根据id移除菜单选项
   * @param ids 要移除的id
   */
  public removeMenuOption(...ids: string[]): void {
    if (ids.length === 0) {
      return;
    }
    this._destoryCheck();
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const targetEle = this._menuEle.querySelector(
        "#" + this._joinId(id)
      ) as HTMLElement;
      if (targetEle) {
        targetEle.remove();
      }
    }
  }

  /**
   * 设置默认单击事件
   * @param fn 单击方法
   */
  public setDefaultClickEvent(fn: (event: MouseEvent) => void): void {
    this._defaultClick = fn;
  }

  /**
   * 是否已经显示
   * @returns 是/否
   */
  public isShow(): boolean {
    return this._menuEle.style.display === "block";
  }
  public hideOption(...ids: string[]): void {
    for (let id of ids) {
      const target = this._menuEle.querySelector(
        "#" + this._joinId(id)
      ) as HTMLElement;
      if (target) {
        target.style.display = "none";
      }
    }
  }
  public showOption(...ids: string[]): void {
    for (let id of ids) {
      const target = this._menuEle.querySelector(
        "#" + this._joinId(id)
      ) as HTMLElement;
      if (target) {
        target.style.display = "block";
      }
    }
  }
}

/**
 * 创建菜单
 * @param menuOptions 菜单选项
 * @returns 菜单操作接口
 */
export function createMenu(menuOptions: MenuOption[]): MenuOperationInterface {
  const menuOperationImpl = new MenuOperationImpl();
  menuOperationImpl.appendMenuOption(...menuOptions);
  return menuOperationImpl;
}
