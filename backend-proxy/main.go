package main

import (
	"encoding/base64"
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

var (
	addr               = flag.String("addr", "127.0.0.1:925", "address for this server to listen on")
	cloudCmdCookieName = flag.String("cookie-name", "flight_file_manager_backend", "cookie name used for cloudcmd cookie")
	dataDir            = flag.String("data-dir", "/opt/flight/var/lib/file-manager-api", "directory for runtime data about running cloudcmd servers")
)

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	_, err := httputil.DumpRequest(r, false)
	if err != nil {
		log.Printf("Failed to dump http request: %s", err)
	}

	err = assertGoodOrigin(r)
	if err != nil {
		log.Printf("Invalid referrer: %s", err)
		w.WriteHeader(403)
		w.Write([]byte(fmt.Sprintf("Invalid referer: %s\n", err)))
		return
	}

	username, password, err := credentialsFromCookies(r)
	if err != nil {
		log.Printf("Invalid credentials: %s", err)
		w.WriteHeader(401)
		w.Write([]byte("Invalid credentials\n"))
		return
	}
	port, err := cloudCmdPort(username)
	if err != nil {
		log.Printf("%s", err)
		w.WriteHeader(500)
		w.Write([]byte(fmt.Sprintf("Unable to determine cloudcmd port: %s\n", err)))
		return
	}

	proxy := &httputil.ReverseProxy{
		Rewrite: func(r *httputil.ProxyRequest) {
			r.Out.URL.Scheme = "http"
			r.Out.URL.Host = fmt.Sprintf("127.0.0.1:%d", port)
			r.Out.SetBasicAuth(username, password)
			log.Printf("%s -> %s\n", r.In.URL.String(), r.Out.URL.String())
		},
	}
	proxy.ServeHTTP(w, r)
}

func assertGoodOrigin(r *http.Request) error {
	referrer := r.Referer()
	// Work around Firefox sometimes not including the referer/origin header.
	// But only for GET requests.
	if referrer == "" {
		if r.Method == "GET" {
			return nil
		}
		return fmt.Errorf("referer not provided")
	}

	referrerUri, err := url.Parse(referrer)
	if err != nil {
		return fmt.Errorf("parsing referer header: %w", err)
	}
	if !strings.Contains(referrerUri.Hostname(), r.Host) && !strings.Contains(referrerUri.Host, r.Host) {
		return fmt.Errorf("invalid referer: %s", r.Host)
	}
	return nil
}

func credentialsFromCookies(r *http.Request) (username string, password string, err error) {
	cookie, err := r.Cookie(*cloudCmdCookieName)
	if err != nil {
		return "", "", err
	}
	// The value is URL and base64 encoded.
	decodedValue, err := url.QueryUnescape(cookie.Value)
	if err != nil {
		return "", "", err
	}
	credentials, err := base64.StdEncoding.DecodeString(decodedValue)
	if err != nil {
		return "", "", err
	}
	parts := strings.Split(string(credentials), ":")
	return parts[0], parts[1], nil
}

func cloudCmdPort(username string) (int, error) {
	portPath := filepath.Join(*dataDir, username, "cloudcmd.port")
	portString, err := os.ReadFile(portPath)
	if err != nil {
		return 0, fmt.Errorf("reading cloudcmd port for %s: %w", username, err)
	}
	port, err := strconv.Atoi(strings.TrimRight(string(portString), "\n"))
	if err != nil {
		return 0, fmt.Errorf("parsing cloudcmd port for %s: %w", username, err)
	}
	return port, nil
}

func main() {
	flag.Parse()
	http.HandleFunc("/", proxyHandler)
	log.Printf("Starting proxy server on %s\n", *addr)
	if err := http.ListenAndServe(*addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
