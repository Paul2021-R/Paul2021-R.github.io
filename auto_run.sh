#! /bin/bash

today=`date +%y-%m-%d`
echo "----------------------------------------"
echo $today 
echo "블로그 업로드 자동화 프로그램"
echo "ver 1.0.4"
echo "----------------------------------------"
sleep 1 && clear
git status
echo "----------------------------------------"
echo "업데이트 할 내용을 입력 해주십시오."
echo "----------------------------------------"
read comment
clear
echo "----------------------------------------"
echo "당신이 기재한 내용은 아래와 같습니다."
echo "$today : $comment"
echo "해당 내용으로 깃 커밋을 진행합니까? (1)Yes / (2)no"
echo "----------------------------------------"
read answer
no=2
if [ $answer -eq $no ] ; then
	echo "----------------------------------------"
	echo "블로그 업로드를 취소합니다."
	echo "프로그램을 종료합니다."
	echo "----------------------------------------"
	exit
fi
echo "----------------------------------------"
echo "깃 커밋을 진행합니다." 
echo "----------------------------------------"
sleep 1 & clear 
sudo git add .
sudo git commit -m "$today : $comment"
echo "----------------------------------------"
sleep 1 && clear
echo "----------------------------------------"
echo "깃 푸쉬를 진행합니다."
echo "----------------------------------------"
sudo git push -u origin main
sleep 1 && clear
echo "----------------------------------------"
echo "디플로이를 실행합니다."
echo "----------------------------------------"
sudo npm run deploy
echo "----------------------------------------"
sleep 1 && echo "모든 작업이 마무리 되었습니다."
echo "블로그 게시글을 확인하십시오."
echo "블로그 :  https://paul2021-r.github.io"
echo "레포지터리 : https://github.com/Paul2021-R/Paul2021-R.github.io"
echo "구글 애널리틱스 : https://analytics.google.com"
echo "----------------------------------------"
exit
