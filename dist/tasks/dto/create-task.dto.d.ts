export declare class CreateTaskDto {
    clientId?: string;
    title: string;
    category?: string;
    minimumMinutes: number;
    targetDays: number[];
    isActive?: boolean;
}
