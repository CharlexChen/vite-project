// packages/playground/src/main.ts
import './index.css';

import { chunkArr, getFullDateTime } from './tool';


const element = document.querySelector('.container');

element.innerHTML = 'Hello World<br />' + getFullDateTime() + '<br />';

console.log(chunkArr(3, ['a', 'b', 'c', 'd', 'e', 'f', 'g']));
