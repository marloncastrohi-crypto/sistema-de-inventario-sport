package com.sportstock;

import com.sportstock.model.User;
import com.sportstock.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SportStockApplication {
    public static void main(String[] args) {
        SpringApplication.run(SportStockApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                // Asegurar que el usuario admin exista y tenga la contraseña hasheada
                User admin = userRepository.findByUsername("admin").orElse(new User());
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123")); // Contraseña: admin123
                if (admin.getId() == null) {
                    admin.setEmail("admin@sportstock.com");
                    admin.setName("Administrador");
                    admin.setRole("admin");
                }
                userRepository.save(admin);

                // Asegurar que un usuario normal exista
                User user = userRepository.findByUsername("usuario").orElse(new User());
                user.setUsername("usuario");
                user.setPassword(passwordEncoder.encode("123456")); // Contraseña: 123456
                if (user.getId() == null) {
                    user.setEmail("usuario@sportstock.com");
                    user.setName("Usuario Empleado");
                    user.setRole("usuario");
                }
                userRepository.save(user);

                System.out.println("✅ Usuarios por defecto creados/actualizados exitosamente.");
                System.out.println("➡️ Admin: admin / admin123");
                System.out.println("➡️ User: usuario / 123456");
            } catch (Exception e) {
                System.err.println("❌ Error al iniciar datos de usuario: " + e.getMessage());
            }
        };
    }
}
