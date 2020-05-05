import { PipeTransform, NotAcceptableException } from '@nestjs/common';
import { TaskStatus } from '../task.model';

export class TaskStatusValidation implements PipeTransform {
  transform(value: any, metadata: import('@nestjs/common').ArgumentMetadata) {
    if (!this.isValidStatus(value)) {
      throw new NotAcceptableException(`${value} is invalid`);
    }
  }

  private isValidStatus(value: string): boolean {
    for (let status in TaskStatus) {
      if (status === value) {
        return true;
      } else {
        return false;
      }
    }
  }
}
