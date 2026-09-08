package com.sb.erp.appr.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ApprFormId implements Serializable {
	private Long forId;
	private Long forVersion;
}

/*

ApprForm 복합키 (for_id + for_version)
@IdClass로 쓸 키 클래스는 반드시
1. Serializable 구현
-> 객체를 바이트 형태로 변환할수 있어야 하기때문 / 변환 가능한 객체라고 자바에가 알려주는 표시

2. 기본 생성자 필요 / @NoArgsConstructor, @AllArgsConstructor
-> 내부적으로 먼저 빈 객체를 만들고 나중에 필드값을 채워넣는 방식으로 동작하기 때문에
   아무것도 받지않은 생성자가 있어야함 / @NoArgsConstructor 가 그 기능
   
3. @EqualsAndHashCode 구현
-> 두개의 키가 같은 row를 가르키는지를 판단할때 사용함
   이 키로 조회한 Entity가 있는지 확인할때 내부적으로 호출함
   
4. 필드 이름이 Entity 의 @Id 필드 이름과 정확히 같아야 함
-> @IdClass는 Entity에 @Id가 붙은 필드들의 이름을 보고 이 키클래스에서
   같은 이름의 필드를 찾아서 매칭 하는 방식으로 동작함
   forId, forVersion이라는 이름으로 @Id를 붙이면 이 키클래스에도 정확히 두가지 필드명이 있어야함

*/