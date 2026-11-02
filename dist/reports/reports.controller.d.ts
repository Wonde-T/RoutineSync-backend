import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { WeeklyReportQueryDto } from './dto/weekly-report-query.dto';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    weekly(user: AuthUser, query: WeeklyReportQueryDto): Promise<import("./weekly-report.types").WeeklyReport>;
}
