package com.sb.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BootSBerpApplication {

	public static void main(String[] args) {
		SpringApplication.run(BootSBerpApplication.class, args);
	}

}
/*
 * 	docker exec  -it  my-redis  redis-cli
	docker exec  -it  my-redis  redis-cli  FLUSHALL
	
	keys *
	
 * http://localhost:8080/swagger-ui/index.html
 */
