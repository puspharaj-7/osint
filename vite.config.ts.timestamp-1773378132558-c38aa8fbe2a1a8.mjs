// vite.config.ts
import { defineConfig } from "file:///C:/Users/pusph/OneDrive/Desktop/QIQ/gdss/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/pusph/OneDrive/Desktop/QIQ/gdss/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/pusph/OneDrive/Desktop/QIQ/gdss/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\pusph\\OneDrive\\Desktop\\QIQ\\gdss";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    },
    proxy: {
      "/api/hibp": { target: "https://haveibeenpwned.com", changeOrigin: true, rewrite: (path2) => path2.replace(/^\/api\/hibp/, "") },
      "/api/whoisxml": { target: "https://www.whoisxmlapi.com", changeOrigin: true, rewrite: (path2) => path2.replace(/^\/api\/whoisxml/, "") },
      "/api/ipinfo": { target: "https://ipinfo.io", changeOrigin: true, rewrite: (path2) => path2.replace(/^\/api\/ipinfo/, "") },
      "/api/virustotal": { target: "https://www.virustotal.com", changeOrigin: true, rewrite: (path2) => path2.replace(/^\/api\/virustotal/, "") },
      "/api/opensanctions": { target: "https://api.opensanctions.org", changeOrigin: true, rewrite: (path2) => path2.replace(/^\/api\/opensanctions/, "") },
      "/api/hunter": { target: "https://api.hunter.io", changeOrigin: true, rewrite: (path2) => path2.replace(/^\/api\/hunter/, "") },
      "/api/opencorporates": { target: "https://api.opencorporates.com", changeOrigin: true, rewrite: (path2) => path2.replace(/^\/api\/opencorporates/, "") },
      "/api/abstract": { target: "https://phonevalidation.abstractapi.com", changeOrigin: true, rewrite: (path2) => path2.replace(/^\/api\/abstract/, "") }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwdXNwaFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFFJUVxcXFxnZHNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwdXNwaFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFFJUVxcXFxnZHNzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9wdXNwaC9PbmVEcml2ZS9EZXNrdG9wL1FJUS9nZHNzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIGhtcjoge1xyXG4gICAgICBvdmVybGF5OiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaS9oaWJwJzogeyB0YXJnZXQ6ICdodHRwczovL2hhdmVpYmVlbnB3bmVkLmNvbScsIGNoYW5nZU9yaWdpbjogdHJ1ZSwgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2hpYnAvLCAnJykgfSxcclxuICAgICAgJy9hcGkvd2hvaXN4bWwnOiB7IHRhcmdldDogJ2h0dHBzOi8vd3d3Lndob2lzeG1sYXBpLmNvbScsIGNoYW5nZU9yaWdpbjogdHJ1ZSwgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL3dob2lzeG1sLywgJycpIH0sXHJcbiAgICAgICcvYXBpL2lwaW5mbyc6IHsgdGFyZ2V0OiAnaHR0cHM6Ly9pcGluZm8uaW8nLCBjaGFuZ2VPcmlnaW46IHRydWUsIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9pcGluZm8vLCAnJykgfSxcclxuICAgICAgJy9hcGkvdmlydXN0b3RhbCc6IHsgdGFyZ2V0OiAnaHR0cHM6Ly93d3cudmlydXN0b3RhbC5jb20nLCBjaGFuZ2VPcmlnaW46IHRydWUsIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC92aXJ1c3RvdGFsLywgJycpIH0sXHJcbiAgICAgICcvYXBpL29wZW5zYW5jdGlvbnMnOiB7IHRhcmdldDogJ2h0dHBzOi8vYXBpLm9wZW5zYW5jdGlvbnMub3JnJywgY2hhbmdlT3JpZ2luOiB0cnVlLCByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvb3BlbnNhbmN0aW9ucy8sICcnKSB9LFxyXG4gICAgICAnL2FwaS9odW50ZXInOiB7IHRhcmdldDogJ2h0dHBzOi8vYXBpLmh1bnRlci5pbycsIGNoYW5nZU9yaWdpbjogdHJ1ZSwgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2h1bnRlci8sICcnKSB9LFxyXG4gICAgICAnL2FwaS9vcGVuY29ycG9yYXRlcyc6IHsgdGFyZ2V0OiAnaHR0cHM6Ly9hcGkub3BlbmNvcnBvcmF0ZXMuY29tJywgY2hhbmdlT3JpZ2luOiB0cnVlLCByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvb3BlbmNvcnBvcmF0ZXMvLCAnJykgfSxcclxuICAgICAgJy9hcGkvYWJzdHJhY3QnOiB7IHRhcmdldDogJ2h0dHBzOi8vcGhvbmV2YWxpZGF0aW9uLmFic3RyYWN0YXBpLmNvbScsIGNoYW5nZU9yaWdpbjogdHJ1ZSwgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2Fic3RyYWN0LywgJycpIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1QsU0FBUyxvQkFBb0I7QUFDclYsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxJQUNYO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxhQUFhLEVBQUUsUUFBUSw4QkFBOEIsY0FBYyxNQUFNLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLGdCQUFnQixFQUFFLEVBQUU7QUFBQSxNQUM3SCxpQkFBaUIsRUFBRSxRQUFRLCtCQUErQixjQUFjLE1BQU0sU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsb0JBQW9CLEVBQUUsRUFBRTtBQUFBLE1BQ3RJLGVBQWUsRUFBRSxRQUFRLHFCQUFxQixjQUFjLE1BQU0sU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsa0JBQWtCLEVBQUUsRUFBRTtBQUFBLE1BQ3hILG1CQUFtQixFQUFFLFFBQVEsOEJBQThCLGNBQWMsTUFBTSxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxzQkFBc0IsRUFBRSxFQUFFO0FBQUEsTUFDekksc0JBQXNCLEVBQUUsUUFBUSxpQ0FBaUMsY0FBYyxNQUFNLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLHlCQUF5QixFQUFFLEVBQUU7QUFBQSxNQUNsSixlQUFlLEVBQUUsUUFBUSx5QkFBeUIsY0FBYyxNQUFNLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLGtCQUFrQixFQUFFLEVBQUU7QUFBQSxNQUM1SCx1QkFBdUIsRUFBRSxRQUFRLGtDQUFrQyxjQUFjLE1BQU0sU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsMEJBQTBCLEVBQUUsRUFBRTtBQUFBLE1BQ3JKLGlCQUFpQixFQUFFLFFBQVEsMkNBQTJDLGNBQWMsTUFBTSxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxvQkFBb0IsRUFBRSxFQUFFO0FBQUEsSUFDcEo7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDOUUsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbInBhdGgiXQp9Cg==
