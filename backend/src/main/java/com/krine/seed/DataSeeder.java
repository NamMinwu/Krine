package com.krine.seed;

import com.krine.decision.Objection;
import com.krine.decision.Condition;
import com.krine.decision.Decision;
import com.krine.decision.DecisionOption;
import com.krine.decision.DecisionRepository;
import com.krine.decision.DecisionVersion;
import com.krine.decision.enums.ObjectionResolution;
import com.krine.decision.enums.ConditionType;
import com.krine.decision.enums.DecisionStatus;
import com.krine.decision.enums.FlowStep;
import com.krine.decision.enums.Verdict;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 심사자가 실행하자마자 서비스를 볼 수 있도록 시드 판단 4건을 넣는다.
 * 날짜는 실행일 기준 상대값이라 언제 실행해도 재검토 큐 데모가 성립한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final DecisionRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        repository.saveAll(List.of(phone(), jobOffer(), workout(), meetings()));
        log.info("시드 데이터 4건을 삽입했습니다");
    }

    // 1. 만료된 시점형 조건 → 실행 즉시 재검토 큐에 뜬다
    private Decision phone() {
        Decision d = base("휴대폰을 지금 바꿀까?",
                "약정이 5개월 남아 있지만 배터리 성능이 크게 떨어져 업무 중 충전을 반복하고 있다.",
                "구매",
                "요즘 폰 배터리가 하루도 못 가서 계속 고민이다. 약정이 5개월 남았는데 그냥 바꿔버릴까.",
                "그냥 바꾸고 싶어서", 3);
        d.getCriteria().addAll(List.of("현재 사용 불편", "추가 비용"));
        d.getOptions().add(option("지금 산다",
                List.of("새 기기", "배터리 문제 해결"),
                List.of("남은 약정 비용", "5개월 후 더 좋은 선택지"),
                List.of("현재 불편이 비용보다 크다")));
        d.getOptions().add(option("5개월 기다린다",
                List.of("위약금·중복 비용 절감", "약정 종료"),
                List.of("불편한 기기를 계속 사용"),
                List.of("현재 기기로 5개월은 버틸 수 있다")));
        d.getConditions().add(Condition.builder()
                .text("약정 만료 시점 도래").type(ConditionType.DATE)
                .dueDate(LocalDate.now().minusDays(1)).build());
        d.getConditions().add(Condition.builder()
                .text("기기가 고장 나는 경우").type(ConditionType.EVENT).build());
        d.getObjections().add(Objection.builder()
                .perspective("미래의 가격을 고려한다면?")
                .objection("5개월 후에는 새 모델이 출시되어 지금보다 나은 선택지가 생길 수 있습니다. 그 가능성은 어떻게 평가하셨나요?")
                .userAnswer("배터리 문제로 업무 중 충전이 반복되고 있어서, 미래의 더 나은 선택지보다 현재의 불편을 더 크게 평가했다.")
                .reflectBack("미래의 제품보다 현재의 불편 해소를 더 중요하게 보시는군요. 맞나요?")
                .resolution(ObjectionResolution.DEFENDED).build());
        d.getVersions().add(version(1, "지금 산다", Verdict.INITIAL, null, 3));
        return d;
    }

    // 2. 보류된 반론 → 재검토 큐의 DEFERRED_OBJECTION 데모
    private Decision jobOffer() {
        Decision d = base("이직 제안을 받아들일까?",
                "연봉이 더 높은 이직 제안을 받았지만 새 회사의 팀 분위기와 안정성이 확실하지 않다.",
                "커리어",
                "오늘 이직 제안 답변 기한을 연장했다. 연봉은 좋은데 확신이 안 선다.",
                "확신이 안 서서 일단 보류", 7);
        d.getCriteria().addAll(List.of("성장 가능성", "안정성"));
        d.getOptions().add(option("제안을 받아들인다",
                List.of("연봉 상승", "새로운 도전"),
                List.of("익숙한 팀", "현재 회사에서의 평판"),
                List.of("새 회사에서도 성과를 낼 수 있다")));
        d.getOptions().add(option("현재 회사에 남는다",
                List.of("안정성", "익숙한 환경"),
                List.of("연봉 상승 기회"),
                List.of("현재 회사에서 성장 여지가 남아 있다")));
        d.getConditions().add(Condition.builder()
                .text("현 회사 연봉 협상 결과가 나오는 경우").type(ConditionType.EVENT).build());
        d.getObjections().add(Objection.builder()
                .perspective("성장을 가장 중요하게 본다면?")
                .objection("안정성을 이유로 남는 선택이 반복되면, 성장 기회를 계속 미루게 되는 것은 아닐까요?")
                .resolution(ObjectionResolution.DEFERRED).build());
        d.getVersions().add(version(1, "받아들이지 않는다", Verdict.INITIAL, null, 7));
        return d;
    }

    // 3. 버전 2개 → 판단 변화 타임라인 데모
    private Decision workout() {
        Decision d = base("운동을 아침으로 옮길까?",
                "저녁 약속이 잦아 운동을 거르는 날이 늘고 있다.",
                "생활",
                "이번 주에 운동을 두 번밖에 못 갔다. 저녁 약속이 자꾸 생겨서.",
                "저녁이 편해서 그대로 두고 싶었다", 20);
        d.getCriteria().addAll(List.of("지속 가능성", "수면"));
        d.getOptions().add(option("저녁 운동 유지",
                List.of("퇴근 후 여유", "수면에 영향 없음"),
                List.of("약속에 밀려 거르는 날 증가"),
                List.of("약속을 줄일 수 있다")));
        d.getOptions().add(option("아침으로 변경",
                List.of("변수 없는 시간 확보"),
                List.of("기상 부담"),
                List.of("아침 기상을 유지할 수 있다")));
        d.getConditions().add(Condition.builder()
                .text("한 달 뒤 지속 여부 확인").type(ConditionType.DATE)
                .dueDate(LocalDate.now().plusDays(20)).build());
        d.getVersions().add(version(1, "저녁 운동을 유지한다", Verdict.INITIAL, null, 20));
        d.getVersions().add(version(2, "아침 운동으로 바꾼다", Verdict.REVISED,
                "저녁 약속이라는 변수를 통제할 수 없다는 것을 확인했다. '약속을 줄일 수 있다'는 전제가 틀렸다.", 10));
        return d;
    }

    // 4. 미래 시점형 조건 → 검토 예정(Scheduled) 데모
    private Decision meetings() {
        Decision d = base("팀 회의를 주 2회로 줄일까?",
                "주 4회 정기 회의가 실제 작업 시간을 잠식하고 있다는 의견이 나왔다.",
                "업무",
                "오늘 회의에서 회의를 줄이자는 얘기가 나왔고, 내가 주 2회 안을 결정했다.",
                "회의가 많다는 불만이 커서", 2);
        d.getCriteria().addAll(List.of("작업 집중 시간", "정보 공유 속도"));
        d.getOptions().add(option("주 2회로 줄인다",
                List.of("집중 시간 확보"),
                List.of("이슈 공유 지연 가능성"),
                List.of("비동기 공유로 회의를 대체할 수 있다")));
        d.getOptions().add(option("주 4회 유지",
                List.of("빠른 이슈 공유"),
                List.of("작업 시간 잠식"),
                List.of("회의가 실제로 문제를 빨리 잡아낸다")));
        d.getConditions().add(Condition.builder()
                .text("분기 회고에서 효과 확인").type(ConditionType.DATE)
                .dueDate(LocalDate.now().plusDays(45)).build());
        d.getVersions().add(version(1, "주 2회로 줄인다", Verdict.INITIAL, null, 2));
        return d;
    }

    private static Decision base(String title, String situation, String tag,
                                 String rawDiary, String firstExpression, int daysAgo) {
        return Decision.builder()
                .title(title).situation(situation).topicTag(tag)
                .rawDiary(rawDiary).firstExpression(firstExpression)
                .status(DecisionStatus.ACTIVE).flowStep(FlowStep.DONE)
                .createdAt(LocalDateTime.now().minusDays(daysAgo))
                .updatedAt(LocalDateTime.now().minusDays(daysAgo))
                .build();
    }

    private static DecisionOption option(String label, List<String> gains,
                                         List<String> sacrifices, List<String> premises) {
        return DecisionOption.builder()
                .label(label)
                .gains(new java.util.ArrayList<>(gains))
                .sacrifices(new java.util.ArrayList<>(sacrifices))
                .premises(new java.util.ArrayList<>(premises))
                .build();
    }

    private static DecisionVersion version(int no, String conclusion, Verdict verdict,
                                           String reason, int daysAgo) {
        return DecisionVersion.builder()
                .versionNo(no).conclusion(conclusion).verdict(verdict).reason(reason)
                .createdAt(LocalDateTime.now().minusDays(daysAgo))
                .build();
    }
}
