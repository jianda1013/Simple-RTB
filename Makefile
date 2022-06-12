DC=docker-compose
EX_YML=./Exchange/docker-compose.yml
BD_YML=./Bidders/docker-compose.yml

all:start

start: ## Build and launch the project in background
	docker network create RTB-connection
	@echo "Launch dettached projet and build\n"
	${DC} -f ${EX_YML} up -d --build
	${DC} -f ${BD_YML} up -d --build
stop: ## Stop the project stack
	${DC} -f ${EX_YML} stop
	${DC} -f ${BD_YML} stop
clean: ## Stop and delete the project stack
	${DC} -f ${EX_YML} down
	${DC} -f ${BD_YML} down
	docker network rm RTB-connection
logs:
	@echo "Default logs the Exchange Server, for Bidders Server please use logs_bidder"
	${DC} -f ${EX_YML} logs -f exchange

logs_bidder:
	${DC} -f ${BD_YML} logs -f bidders

logs_exchange:
	${DC} -f ${EX_YML} logs -f exchange

re: clean start

capacity:
	curl -X POST https://reqbin.com/echo/post/json -H "Content-Type: application/json" -d '{"session_id":"0x09TldDD","estimated_traffic":1000,"bidders":[{"name":"test","endpoint":"http://bidders:8080"}],"bidder_setting":{"budget":50,"impression_goal":3}}'  
	wrk -s capacity.lua -t12 -c500 -d10s http://localhost:1337/bid_request

install_dc: ## Install docker
	@echo "install docker"
	sudo curl https://get.docker.com | sudo sh -

install_dcc: ## Install docker-compose
	@echo "install docker compose"
	COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
	echo "version $(COMPOSE_VERSION)"
	sudo sh -c "curl -L https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose"
	sudo chmod +x /usr/local/bin/docker-compose
	sudo sh -c "curl -L https://raw.githubusercontent.com/docker/compose/${COMPOSE_VERSION}/contrib/completion/bash/docker-compose > /etc/bash_completion.d/docker-compose"
	docker-compose -v