package cdu.zjy.topictwo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.upload.audio-path}")
    private String audioPath;

    @Value("${avatar.path}")
    private String avatarPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/audio/**")
                .addResourceLocations("file:///" + audioPath.replace("\\", "/") + "/");
        registry.addResourceHandler("/avatar/**")
                .addResourceLocations("file:///" + avatarPath.replace("\\", "/") + "/");

    }
}


