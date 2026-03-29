/// <reference types="vite/client" />

declare module 'react-window' {
  import { ComponentType, CSSProperties, Component } from 'react';

  export interface ListProps {
    className?: string;
    children?: ComponentType<any>;
    height: number | string;
    rowCount: number;
    rowHeight: number | ((index: number) => number);
    rowComponent: ComponentType<any>;
    rowProps?: any;
    layout?: 'vertical' | 'horizontal';
    onItemsRendered?: (props: any) => any;
    onScroll?: (props: any) => any;
    outerElementType?: string | ComponentType<any>;
    outerRef?: any;
    style?: CSSProperties;
    useIsScrolling?: boolean;
    width: number | string;
  }

  export class List extends Component<ListProps> {}
  export class Grid extends Component<any> {}
}
