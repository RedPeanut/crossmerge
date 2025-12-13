// const EventEmitter = require('events');
import EventEmitter from "events";

/**
 * 이벤트 기반 순차적 작업 큐 클래스 (비-Promise 작업 함수 지원 버전)
 * - 각 작업은 완료 시 다음 작업을 트리거할 콜백 함수(emitNext)를 받습니다.
 * - 작업 함수는 Promise를 반환할 필요가 없습니다.
 */
export class SequentialTaskQueue extends EventEmitter {
  tasks: {taskFn: Function, taskNm: string}[] = [];
  isProcessing: boolean = false;

  constructor() {
    super();
    this.tasks = [];
    this.isProcessing = false;

    // 'task_completed' 이벤트가 발생하면 _processNext를 호출하도록 리스너 설정
    this.on('task_completed', this._processNext);
    console.log('[Queue] 순차적 작업 큐 초기화 완료');
  }

  /**
   * 큐에 새로운 작업을 추가합니다.
   * @param {Function} taskFn - 실행할 함수 (emitNext 콜백을 인수로 받음)
   * @param {string} taskNm - 작업 식별 이름
   */
  addTask(taskFn: Function, taskNm: string = 'Unnamed Task') {
    this.tasks.push({ taskFn, taskNm });
    console.log(`[Queue] 작업 추가: ${taskNm}. 큐 크기: ${this.tasks.length}`);

    /* // 현재 처리 중인 작업이 없다면 즉시 시작합니다.
    if(!this.isProcessing) {
      this._processNext();
    } */
  }

  /**
   * 큐에서 다음 작업을 꺼내어 처리합니다.
   */
  _processNext = () => {
    if(this.tasks.length === 0) {
      this.isProcessing = false;
      console.log('[Queue] 큐 비어있음. 대기 모드');
      return;
    }

    this.isProcessing = true;
    const currentTask = this.tasks.shift();
    const { taskFn, taskNm } = currentTask;

    console.log(`  [Worker] 작업 처리 시작: ${taskNm}`);

    // 다음 작업을 트리거할 헬퍼 함수
    const emitNext = () => {
      console.log(`  [Worker] 작업 완료: ${taskNm}`);
      this.emit('task_completed');
    };

    try {
      // 작업 함수를 실행하고 emitNext 콜백을 인수로 전달합니다.
      // 작업 함수는 완료되면 반드시 emitNext()를 호출해야 합니다.
      taskFn(emitNext);

      // **주의:** 작업 함수가 동기적이라면 이 시점에서 emitNext()가 이미 호출되었을 것입니다.
      // 작업 함수가 비동기적이라면 (예: setTimeout 또는 콜백 기반 API),
      // emitNext()는 그 비동기 로직 내부에서 호출될 것입니다.

    } catch(error) {
       console.error(`  [Worker] 작업 처리 중 오류 발생: ${taskNm}`, error);
       // 오류 발생 시에도 다음 작업을 진행하도록 명시적으로 트리거합니다.
       emitNext();
    }
  }
}