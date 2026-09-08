package com.sb.erp.res.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.com.entity.Company;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.resv.entity.Reservation;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "COM_RESOURCE")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_com_resource")
	@SequenceGenerator(name = "seq_com_resource", sequenceName = "SEQ_COM_RESOURCE", allocationSize = 1)
	@Column(name = "RES_ID")
	private Long resId;
	
	// 회사
	@ManyToOne
	@JoinColumn(name="COM_ID", nullable = false)
	private Company company;
	
	@Column(name = "RES_CODE", length = 50, nullable=false)
	private String resCode;
	@Column(name = "RES_NAME", length = 100, nullable=false)
	private String resName;
	@Column(name = "RES_TYPE", length = 20, nullable=false)
	private String resType; // VEHICLE, ROOM, EQUIPMENT
	@Column(name = "QUANTITY", nullable=false)
	private Long quantity;
	@Column(name = "LOCATION", length = 200)
	private String location;
	@Column(name = "CAPACITY")
	private Long capacity;
	@Column(name = "RES_STATUS", length = 20, nullable=false)
	private String resStatus; // MAINTENANCE, AVAILABLE, DISABLED
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MANAGER_EMP_ID")
	private Employee employee;
	
	@Column(name = "REMARK", length = 255)
	private String remark;
	
	@Column(name="CREATED_AT", nullable=false)
	private LocalDateTime createdAt;
	
	@Column(name="UPDATED_AT", nullable=false)
	private LocalDateTime updatedAt;
	
	@PrePersist
	void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}
	
	@PreUpdate
	void onUpdate() {
		this.updatedAt = LocalDateTime.now();		
	}
	
	// 자원
	@OneToMany(mappedBy ="resource", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Reservation> reservations = new ArrayList<>();
	
}
/*
RES_ID         NOT NULL NUMBER        
COM_ID         NOT NULL NUMBER        
RES_CODE       NOT NULL VARCHAR2(50)  
RES_NAME       NOT NULL VARCHAR2(100) 
RES_TYPE       NOT NULL VARCHAR2(20)  
QUANTITY       NOT NULL NUMBER        
LOCATION                VARCHAR2(200) 
CAPACITY                NUMBER        
RES_STATUS     NOT NULL VARCHAR2(20)  
MANAGER_EMP_ID          NUMBER        
REMARK                  VARCHAR2(255) 
CREATED_AT              DATE          
UPDATED_AT              DATE      
*/