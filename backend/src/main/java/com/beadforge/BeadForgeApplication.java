package com.beadforge;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.beadforge.repository")
public class BeadForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(BeadForgeApplication.class, args);
    }
}
